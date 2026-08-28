import {
	findDbConnection,
	getOrCreateThread,
} from '../services/chatService.js';
import { createLLM } from '../services/llmService.js';
import { createDbAgent, streamAgentEvents } from '../services/agentService.js';
import { getRelevantSavedQueries } from '../services/savedQueryService.js';
import Thread from '../models/Thread.js';
import SavedQuery from '../models/SavedQuery.js';
import mongoose from 'mongoose';

const chatController = {};

chatController.chat = async (req, res) => {
	const { message, connectionId, threadId } = req.body;
	const controller = new AbortController();

	res.on('close', () => {
		console.log('[abort] res close fired, writableEnded:', res.writableEnded);
		if (!res.writableEnded) {
			controller.abort();
		}
	});

	try {
		// Set SSE streaming headers
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		});

		const sendEvent = (eventData) => {
			if (!res.writableEnded) {
				res.write(`data: ${JSON.stringify(eventData)}\n\n`);
			}
		};

		// Finding the DB connection
		const { schema, adapter, customInstructions } = await findDbConnection({
			connectionId,
			userId: req.user.id,
		});

		// Retrieve top relevant saved queries for prompt context
		const savedQueries = await getRelevantSavedQueries({
			connectionId,
			userQuestion: message,
			topK: 3,
		});

		const agent = createDbAgent({
			model: createLLM(),
			adapter,
			schema,
			customInstructions,
			savedQueries,
		});

		// Create or retrieve thread
		const thread = await getOrCreateThread({
			userId: req.user.id,
			connectionId,
			threadId,
			message,
		});

		// Save user message
		thread.messages.push({ role: 'user', content: message });
		await thread.save();

		// Emit initial thread metadata event so client gets thread info right away
		sendEvent({
			type: 'thread_created',
			thread: {
				id: thread._id,
				title: thread.title,
				connection_id: thread.connection,
				created_at: thread.createdAt,
			},
		});

		// Stream tokens & tool execution events from agent
		const { answer, executedQueries } = await streamAgentEvents({
			agent,
			message,
			threadId: thread._id.toString(),
			signal: controller.signal,
			onEvent: (event) => {
				// Skip raw done event so chatController can attach saved DB message to final done event
				if (event.type === 'done') return;
				sendEvent(event);
			},
		});

		if (controller.signal.aborted) {
			console.log('[abort] Request was aborted, skipping DB writes for assistant response');
			return res.end();
		}

		// Save assistant response
		const queryUsed =
			executedQueries.length > 0
				? executedQueries[executedQueries.length - 1]
				: null;

		thread.messages.push({
			role: 'assistant',
			content: answer || 'Sorry, I was unable to generate a response.',
			query_used: queryUsed,
			saved_queries_used: savedQueries.map((p) => ({
				id: p.id,
				question: p.question,
			})),
		});
		await thread.save();

		if (savedQueries && savedQueries.length > 0) {
			const queryIds = savedQueries.map((p) => p.id).filter(Boolean);
			if (queryIds.length > 0) {
				await SavedQuery.updateMany(
					{ _id: { $in: queryIds } },
					{ $inc: { usage_count: 1 } },
				);
			}
		}

		const assistantMessage = thread.messages[thread.messages.length - 1];

		// Emit final 'done' event with saved message and thread data
		sendEvent({
			type: 'done',
			message: assistantMessage,
			thread: {
				id: thread._id,
				title: thread.title,
				connection_id: thread.connection,
				created_at: thread.createdAt,
			},
		});

		res.end();
	} catch (error) {
		console.error('Chat SSE error:', error);
		if (!res.writableEnded) {
			res.write(
				`data: ${JSON.stringify({ type: 'error', error: 'Something went wrong. Please try again.' })}\n\n`,
			);
			res.end();
		}
	}
};

chatController.getThreads = async (req, res) => {
	try {
		const { connectionId } = req.params;
		const threads = await Thread.find({
			connection: connectionId,
			user: req.user.id,
		})
			.select('title pinned createdAt')
			.sort({ updatedAt: -1 });

		res.json(threads);
	} catch (error) {
		console.error('Error fetching threads:', error);
		res.status(500).json({ error: 'Failed to fetch threads' });
	}
};

chatController.getMessages = async (req, res) => {
	try {
		const { threadId } = req.params;
		const thread = await Thread.findOne({ _id: threadId, user: req.user.id });
		if (!thread) return res.status(404).json({ error: 'Thread not found' });

		res.json({
			connection_id: thread.connection,
			messages: thread.messages,
		});
	} catch (error) {
		console.error('Error fetching messages:', error);
		res.status(500).json({ error: 'Failed to fetch messages' });
	}
};

chatController.togglePin = async (req, res) => {
	try {
		const { threadId } = req.params;
		const thread = await Thread.findOne({ _id: threadId, user: req.user.id });

		if (!thread) return res.status(404).json({ error: 'Thread not found' });

		thread.pinned = !thread.pinned;
		await thread.save();

		res.json(thread);
	} catch (error) {
		console.error('Error toggling pin state:', error);
		res.status(500).json({ error: 'Failed to toggle pin state' });
	}
};

chatController.updateThreadTitle = async (req, res) => {
	const { threadId } = req.params;
	const { title } = req.body;

	if (!title || !title.trim())
		return res.status(400).json({ error: 'title is required' });

	if (title.trim().length > 100) {
		return res.status(400).json({ error: 'Title too long' });
	}

	try {
		const thread = await Thread.findOneAndUpdate(
			{ _id: threadId, user: req.user.id },
			{ title: title.trim() },
			{ returnDocument: 'after', runValidators: true },
		);

		if (!thread) return res.status(404).json({ error: 'Thread not found' });

		res.json(thread);
	} catch (error) {
		console.error('Error updating thread title:', error);
		res.status(500).json({ error: 'Failed to update thread title' });
	}
};

chatController.deleteThread = async (req, res) => {
	const { threadId } = req.params;
	try {
		const thread = await Thread.findOneAndDelete({
			_id: threadId,
			user: req.user.id,
		});

		if (thread) {
			// Clean up orphaned LangGraph checkpoints
			const db = mongoose.connection.db;
			await Promise.all([
				db.collection('checkpoints').deleteMany({ thread_id: threadId }),
				db.collection('checkpoint_writes').deleteMany({ thread_id: threadId }),
				db.collection('checkpoint_blobs').deleteMany({ thread_id: threadId }),
			]);
		}
		res.json(thread);
	} catch (error) {
		console.log(error);

		res.status(500).json({ error: 'Something went wrong' });
	}
};

export default chatController;
