import {
	findDbConnection,
	getOrCreateThread,
} from '../services/chatService.js';
import { createLLM } from '../services/llmService.js';
import { createDbAgent, invokeAgent } from '../services/agentService.js';
import { getRelevantPatterns } from '../services/patternService.js';
import Thread from '../models/Thread.js';
import LearnedPattern from '../models/LearnedPattern.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

const chatController = {};

chatController.chat = async (req, res) => {
	const { message, connectionId, threadId } = req.body;
	try {
		const user = await User.findById(req.user.id);
		// Finding the DB connection
		const { schema, adapter, customInstructions } = await findDbConnection({
			connectionId,
			userId: req.user.id,
		});

		// Retrieve top relevant learned patterns for prompt context
		const learnedPatterns = await getRelevantPatterns({
			connectionId,
			userQuestion: message,
			topK: 3,
		});

		// Invoke agent
		const llm = createLLM();

		const agent = createDbAgent({
			model: llm,
			adapter,
			schema,
			customInstructions,
			learnedPatterns,
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

		const { answer, executedQueries } = await invokeAgent({
			agent,
			message,
			threadId: thread._id.toString(),
		});

		// Save assistant response
		const queryUsed =
			executedQueries.length > 0
				? executedQueries[executedQueries.length - 1]
				: null;

		thread.messages.push({
			role: 'assistant',
			content: answer || 'Sorry, I was unable to generate a response.',
			query_used: queryUsed,
			patterns_used: learnedPatterns.map((p) => ({
				id: p.id,
				question: p.question,
			})),
		});
		await thread.save();

		if (learnedPatterns && learnedPatterns.length > 0) {
			const patternIds = learnedPatterns.map((p) => p.id).filter(Boolean);
			if (patternIds.length > 0) {
				await LearnedPattern.updateMany(
					{ _id: { $in: patternIds } },
					{ $inc: { usage_count: 1 } },
				);
			}
		}

		const assistantMessage = thread.messages[thread.messages.length - 1];

		res.json({
			message: assistantMessage.toJSON ? assistantMessage.toJSON() : assistantMessage,
			thread: {
				id: thread._id,
				title: thread.title,
				connection_id: thread.connection,
				created_at: thread.createdAt,
			},
		});
	} catch (error) {
		console.error('Chat error:', {
			name: error.name,
			message: error.message,
			status: error.status,
		});
		res.status(500).json({ error: 'Something went wrong. Please try again.' });
	}
};

chatController.getThreads = async (req, res) => {
	const { connectionId } = req.params;
	const threads = await Thread.find({
		connection: connectionId,
		user: req.user.id,
	})
		.select('title pinned createdAt')
		.sort({ updatedAt: -1 });

	res.json(threads);
};

chatController.getMessages = async (req, res) => {
	const { threadId } = req.params;
	const thread = await Thread.findOne({ _id: threadId, user: req.user.id });
	if (!thread) return res.status(404).json({ error: 'Thread not found' });

	res.json(thread.messages);
};

chatController.togglePin = async (req, res) => {
	const { threadId } = req.params;
	const thread = await Thread.findOne({ _id: threadId, user: req.user.id });

	if (!thread) return res.status(404).json({ error: 'Thread not found' });

	thread.pinned = !thread.pinned;
	await thread.save();

	res.json(thread);
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
