import Connection from '../models/Connection.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import dbManager from '../services/dbManager.js';
import Thread from '../models/Thread.js';
import mongoose from 'mongoose';

const connectionController = {};

connectionController.connect = async (req, res) => {
	try {
		const { uri, name } = req.body;

		let dbType;
		if (uri.startsWith('postgres://') || uri.startsWith('postgresql://'))
			dbType = 'postgres';
		else if (uri.startsWith('mysql://')) dbType = 'mysql';
		else
			return res
				.status(400)
				.json({ error: 'Unsupported URI. Use postgres:// or mysql://' });

		const encryptedUri = encrypt(uri);
		const connection = await Connection.create({
			user: req.user.id,
			name,
			encrypted_uri: encryptedUri,
			db_type: dbType,
		});

		try {
			const result = await dbManager.connect({
				userId: req.user.id,
				connectionId: connection._id.toString(),
				uri,
			});

			res.status(201).json({
				connection: {
					id: connection._id,
					name: connection.name,
					db_type: connection.db_type,
					is_active: true,
				},
				schema: result.schema,
			});
		} catch (connectError) {
			// Connection failed — clean up the orphaned DB record
			await connection.deleteOne();
			throw connectError;
		}
	} catch (error) {
		console.error('Connection error:', error);
		res.status(500).json({ error: error.message || 'Failed to connect' });
	}
};

connectionController.list = async (req, res) => {
	let connections = await Connection.find({ user: req.user.id })
		.select('name db_type createdAt')
		.sort({ createdAt: -1 });

	connections = connections.map((conn) => ({
		id: conn._id,
		name: conn.name,
		db_type: conn.db_type,
		createdAt: conn.createdAt,
		is_active: dbManager.isConnected({
			userId: req.user.id,
			connectionId: conn._id.toString(),
		}),
	}));

	res.json(connections);
};

connectionController.activate = async (req, res) => {
	try {
		const { id } = req.params;
		const connection = await Connection.findOne({ _id: id, user: req.user.id });
		if (!connection)
			return res.status(404).json({ error: 'Connection not found' });

		const connId = connection._id.toString();

		if (dbManager.isConnected({ userId: req.user.id, connectionId: connId })) {
			const schema = dbManager.getSchema({
				userId: req.user.id,
				connectionId: connId,
			});
			return res.json({
				connection: {
					id: connection._id,
					name: connection.name,
					db_type: connection.db_type,
					is_active: true,
				},
				schema,
			});
		}

		const uri = decrypt(connection.encrypted_uri);
		const result = await dbManager.connect({
			userId: req.user.id,
			connectionId: connId,
			uri,
		});

		res.json({
			connection: {
				id: connection._id,
				name: connection.name,
				db_type: connection.db_type,
				is_active: true,
			},
			schema: result.schema,
		});
	} catch (error) {
		console.error('Activate error:', error);
		res
			.status(500)
			.json({ error: error.message || 'Failed to activate connection' });
	}
};

connectionController.disconnect = async (req, res) => {
	try {
		const { id } = req.params;
		const connection = await Connection.findById(id);
		if (!connection) {
			return res.status(404).json({ error: 'Connection not found' });
		}
		await dbManager.disconnect({ userId: req.user.id, connectionId: id });
		res.json({
			id: connection._id,
			name: connection.name,
			db_type: connection.db_type,
			is_active: false,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

connectionController.remove = async (req, res) => {
	try {
		const { id } = req.params;
		await dbManager.disconnect({ userId: req.user.id, connectionId: id });

		const deletedConnection = await Connection.findOneAndDelete({
			_id: id,
			user: req.user.id,
		});

		if (!deletedConnection) {
			return res.status(404).json({ error: 'Connection not found' });
		}

		// Clean up all threads and checkpoints for this connection
		const threads = await Thread.find({ connection: id }).select('_id');
		const threadIds = threads.map((t) => t._id.toString());

		if (threadIds.length > 0) {
			const db = mongoose.connection.db;
			await Promise.all([
				Thread.deleteMany({ connection: id }),
				db
					.collection('checkpoints')
					.deleteMany({ thread_id: { $in: threadIds } }),
				db
					.collection('checkpoint_writes')
					.deleteMany({ thread_id: { $in: threadIds } }),
				db
					.collection('checkpoint_blobs')
					.deleteMany({ thread_id: { $in: threadIds } }),
			]);
		}

		res.json(deletedConnection);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

connectionController.updateName = async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;

	if (!name || !name.trim())
		return res.status(400).json({ error: 'Name is required' });

	if (name.trim().length > 50) {
		return res.status(400).json({ error: 'Name too long' });
	}

	try {
		const updatedConnection = await Connection.findOneAndUpdate(
			{ _id: id, user: req.user.id },
			{ name: name.trim() },
			{ returnDocument: 'after' },
		);

		if (!updatedConnection)
			return res.status(404).json({ error: 'Connection not found' });

		res.json(updatedConnection);
	} catch (error) {
		res.status(500).json({ error: 'Failed to update connection' });
	}
};

export default connectionController;
