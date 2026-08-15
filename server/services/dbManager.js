import { PostgresAdapter } from './adapters/PostgresAdapter.js';
import { MySQLAdapter } from './adapters/MySQLAdapter.js';
import { MongoAdapter } from './adapters/MongoAdapter.js';

const ADAPTERS = {
	postgres: PostgresAdapter,
	mysql: MySQLAdapter,
	mongodb: MongoAdapter,
};

class DBManager {
	// The pool is a Map (key-value store) that holds all active adapters
	// Key:   "userId-connectionId" (e.g., "abc123-def456")
	// Value: adapter instance (PostgresAdapter, MySQLAdapter, MongoAdapter, etc.)
	constructor() {
		this.pool = new Map();
	}

	#key({ userId, connectionId }) {
		return `${userId}-${connectionId}`;
	}

	#detectType(uri) {
		if (uri.startsWith('postgres://') || uri.startsWith('postgresql://'))
			return 'postgres';
		if (uri.startsWith('mysql://')) return 'mysql';
		if (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))
			return 'mongodb';
		throw new Error(
			'Unsupported database URI. Use a postgres://, mysql://, or mongodb:// connection string.',
		);
	}

	async connect({ userId, connectionId, uri }) {
		const key = this.#key({ userId, connectionId });

		// Close any existing connection first (prevents duplicate connections)
		await this.disconnect({ userId, connectionId });

		const type = this.#detectType(uri);
		const AdapterClass = ADAPTERS[type];
		const adapter = new AdapterClass();

		await adapter.connect(uri);
		const schema = await adapter.extractSchema();

		// Cache the schema on the adapter for easy access
		adapter.schema = schema;

		this.pool.set(key, adapter);

		return { type, schema };
	}

	getAdapter({ userId, connectionId }) {
		const adapter = this.pool.get(this.#key({ userId, connectionId }));
		if (!adapter) throw new Error('No active connection. Please connect first.');
		return adapter;
	}

	isConnected({ userId, connectionId }) {
		const adapter = this.pool.get(this.#key({ userId, connectionId }));
		return adapter?.isConnected ?? false;
	}

	async disconnect({ userId, connectionId }) {
		const key = this.#key({ userId, connectionId });
		const adapter = this.pool.get(key);

		if (adapter?.isConnected) {
			await adapter.disconnect();
		}

		this.pool.delete(key);
	}
}

export default new DBManager();
