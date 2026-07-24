import {
	findDbConnection,
	getOrCreateThread,
} from '../services/chatService.js';
import { createLLM } from '../services/llmService.js';
import { createSqlAgent, invokeAgent } from '../services/agentService.js';
import Thread from '../models/Thread.js';

const chatController = {};

chatController.chat = async (req, res) => {
	const { message, connectionId, threadId } = req.body;
	try {
		// Finding the DB connection
		const { schema, dataSource } = await findDbConnection({
			connectionId,
			userId: req.user.id,
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

		// Invoke agent
		const llm = createLLM();
		const agent = createSqlAgent({ model: llm, dataSource, schema });
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
			content: answer,
			sql_query: sqlUsed,
		});
		await thread.save();

		res.json({
			threadId: thread._id,
			answer,
			sql: sqlUsed,
		});
	} catch (error) {
		console.error('Chat error:', error);
		res.status(500).json({ error: error.message || 'Something went wrong' });
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
	res.status(404).json({ error: 'Not implemented' });
};

chatController.deleteThread = async (req, res) => {
	res.status(404).json({ error: 'Not implemented' });
};

export default chatController;
