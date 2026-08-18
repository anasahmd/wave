import Connection from '../models/Connection.js';
import Thread from '../models/Thread.js';
import { decrypt } from '../utils/encryption.js';
import dbManager from './dbManager.js';

export async function findDbConnection({ userId, connectionId }) {
	const connection = await Connection.findOne({
		_id: connectionId,
		user: userId,
	});

	if (!connection) throw new Error('Connection not found');

	// Auto-reconnect if needed
	if (!dbManager.isConnected({ userId, connectionId })) {
		const uri = decrypt(connection.encrypted_uri);
		await dbManager.connect({
			userId,
			connectionId,
			uri,
		});
	}

	const adapter = dbManager.getAdapter({ userId, connectionId });

	return {
		adapter,
		schema: adapter.schema,
		customInstructions: connection.custom_instructions || '',
	};
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
		if (!thread) throw new Error('Thread not found');
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
