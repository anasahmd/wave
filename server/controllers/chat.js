const chatController = {};

chatController.chat = async (req, res) => {
	try {
		const { message, connectionId, threadId } = req.body;

		// Finding the DB connection
		const connection = await Connection.findOne({
			_id: connectionId,
			user: req.user.id,
		});
		if (!connection)
			return res.status(404).json({ error: 'Connection not found' });


		// Auto-reconnect if needed
		if (!dbManager.isConnected({ userId: req.user.id, connectionId })) {
			const uri = decrypt(connection.encrypted_uri);
			await dbManager.connect({
				userId: req.user.id,
				connectionId,
				uri,
			});
		}

		const dataSource = dbManager.getDataSource({
			userId: req.user.id,
			connectionId,
		});
		const schema = dbManager.getSchema({
			userId: req.user.id,
			connectionId,
		});
		const dbType = dbManager.getType({
			userId: req.user.id,
			connectionId,
		});

		// Create or retrieve thread
		let thread;
		if (threadId) {
			thread = await Thread.findOne({ _id: threadId, user: req.user.id });
			if (!thread) return res.status(404).json({ error: 'Thread not found' });
		} else {
			const title =
				message.length > 50 ? message.slice(0, 47) + '...' : message;
			thread = await Thread.create({
				user: req.user.id,
				connection: connectionId,
				title,
				messages: [],
			});
		}

		// Save user message
		thread.messages.push({ role: 'user', content: message });
		await thread.save();

		// Invoke agent
		const llm = createLLM();
		const agent = createSqlAgent({ llm, dataSource, schema });
		const { answer, executedQueries } = await invokeAgent(
			agent,
			message,
			thread._id.toString(),
		);

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
		res.status(500).json({ error: error.message || 'Chat failed' });
	}
};

chatController.getThreads = async (req, res) => {
	res.status(404).json({ error: 'Not implemented' });
};

chatController.getMessages = async (req, res) => {
	res.status(404).json({ error: 'Not implemented' });
};

chatController.deleteThread = async (req, res) => {
	res.status(404).json({ error: 'Not implemented' });
};

export default chatController;
