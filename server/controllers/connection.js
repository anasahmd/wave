import Connection from '../models/Connection.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import dbManager from '../utils/dbManager.js';

const connectionController = {}

connectionController.connect = (req, res) => {
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
			},
			tables: result.tables,
			schema: result.schema,
		});
	} catch (error) {
		console.error('Connection error:', error);
		res.status(500).json({ error: error.message || 'Failed to connect' });
	}
}

connectionController.list = (req, res) => {
	const connections = await Connection.find({ user: req.user.id })
		.select('name db_type createdAt')
		.sort({ createdAt: -1 });

	res.json(connections);
}

connectionController.activate = (req, res) => {
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
				},
				tables: Object.keys(schema),
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
			},
			tables: result.tables,
			schema: result.schema,
		});
	} catch (error) {
		console.error('Activate error:', error);
		res
			.status(500)
			.json({ error: error.message || 'Failed to activate connection' });
	}
}

connectionController.disconnect = (req, res) => {
	try {
		const { id } = req.params;
		await dbManager.disconnect({ userId: req.user.id, connectionId: id });
		res.json({ message: 'Disconnected' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

connectionController.remove = (req, res) => {
	try {
		const { id } = req.params;
		await dbManager.disconnect({ userId: req.user.id, connectionId: id });
		await Connection.findOneAndDelete({ _id: id, user: req.user.id });
		res.json({ message: 'Connection removed' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export default connectionController;