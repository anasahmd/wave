import {
	findDbConnection,
	getOrCreateThread,
} from '../services/chatService.js';
import { createLLM } from '../services/llmService.js';
import { createSqlAgent, invokeAgent } from '../services/agentService.js';
import Thread from '../models/Thread.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

const chatController = {};

chatController.chat = async (req, res) => {
	const { message, connectionId, threadId } = req.body;
	try {
		const user = await User.findById(req.user.id);
		// Finding the DB connection
		const { schema, dataSource } = await findDbConnection({
			connectionId,
			userId: req.user.id,
		});

		// Invoke agent
		const llm = createLLM(user.llm_config);

		const agent = createSqlAgent({ model: llm, dataSource, schema });

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
		const sqlUsed =
			executedQueries.length > 0 ? executedQueries.join(';\n') : null;

		thread.messages.push({
			role: 'assistant',
			content: answer || 'Sorry, I was unable to generate a response.',
			sql_query: sqlUsed,
		});
		await thread.save();

		const assistantMessage = thread.messages[thread.messages.length - 1];

		res.json({
			message: assistantMessage,
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
		.select('title createdAt')
		.sort({ createdAt: -1 });

	res.json(threads);
};

chatController.getMessages = async (req, res) => {
	const { threadId } = req.params;
	const thread = await Thread.findOne({ _id: threadId, user: req.user.id });
	if (!thread) return res.status(404).json({ error: 'Thread not found' });

	res.json(thread.messages);
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
