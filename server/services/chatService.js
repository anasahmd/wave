import Connection from '../models/Connection.js';
import Thread from '../models/Thread.js';
import { decrypt } from '../utils/encryption.js';
import dbManager from './dbManager.js';

export async function findDbConnection({ userId, connectionId }) {
	const connection = await Connection.findOne({
		_id: connectionId,
		user: userId,
	});

	if (!connection)
		return res.status(404).json({ error: 'Connection not found' });

	// Auto-reconnect if needed
	if (!dbManager.isConnected({ userId: userId, connectionId })) {
		const uri = decrypt(connection.encrypted_uri);
		await dbManager.connect({
			userId: userId,
			connectionId,
			uri,
		});
	}

	const dataSource = dbManager.getDataSource({
		userId: userId,
		connectionId,
	});

	const schema = dbManager.getSchema({
		userId: userId,
		connectionId,
	});

	return { dataSource, schema };
}

export async function getOrCreateThread({
	threadId,
	userId,
	connectionId,
	message,
}) {
	let thread;
	if (threadId) {
		thread = await Thread.findOne({ _id: threadId, user: userId });
		if (!thread) return res.status(404).json({ error: 'Thread not found' });
	} else {
		const title = message.length > 50 ? message.slice(0, 47) + '...' : message;
		thread = await Thread.create({
			user: userId,
			connection: connectionId,
			title,
			messages: [],
		});
	}
	return thread;
}
