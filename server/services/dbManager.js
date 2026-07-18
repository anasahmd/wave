import { DataSource } from 'typeorm';

class DBManager {
	// The pool is a Map (key-value store) that holds all active connections
	// Key:   "userId-connectionId" (e.g., "abc123-def456")
	// Value: { dataSource, dbType, schema }
	constructor() {
		this.pool = new Map();
	}

	#key({ userId, connectionId }) {
		return `${userId}-${connectionId}`;
	}

	async connect({ userId, connectionId, uri }) {
		const key = this.#key({ userId, connectionId });

		// Close any existing connection first (prevents duplicate connections)
		await this.disconnect({ userId, connectionId });

		// Detect the database type
		let type;
		if (uri.startsWith('postgres://') || uri.startsWith('postgresql://')) {
			type = 'postgres';

			// Suppress pg-connection-string security warning without affecting functionality
			// by explicitly using 'verify-full' for aliases as recommended by the warning.
			try {
				const urlObj = new URL(uri);
				const sslmode = urlObj.searchParams.get('sslmode');
				if (['require', 'prefer', 'verify-ca'].includes(sslmode)) {
					urlObj.searchParams.set('sslmode', 'verify-full');
					uri = urlObj.toString();
				}
			} catch (err) {
				// Ignore invalid URL parsing errors
			}
		} else if (uri.startsWith('mysql://')) {
			type = 'mysql';
		} else {
			throw new Error(
				'Unsupported database URI. Use a postgres:// or mysql:// connection string.',
			);
		}

		// Create a TypeORM DataSource
		const dataSource = new DataSource({
			type,
			url: uri,
			synchronize: false, // Prevents destructive operation based on schema
			logging: false,
		});

		await dataSource.initialize();

		// Read the schema (what tables and columns exist)
		const schema = await this.#extractSchema(dataSource, type);

		// Cache the connection
		this.pool.set(key, { dataSource, dbType: type, schema });

		return { type, tables: Object.keys(schema), schema };
	}

	async #extractSchema(dataSource, type) {
		// This lets us execute raw sql on the connected database
		const queryRunner = dataSource.createQueryRunner();
		const schema = {};

		try {
			let tables = [];

			if (type === 'postgres') {
				// Postgres uses the information_schema standard
				const result = await queryRunner.query(
					`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`,
				);
				tables = result.map((row) => row.table_name);
			} else if (type === 'mysql') {
				const result = await queryRunner.query(`SHOW TABLES;`);
				// MySQL returns rows like { Tables_in_dbname: "users" }
				// so we grab the first value from each row
				tables = result.map((row) => Object.values(row)[0]);
			}

			for (const table of tables) {
				let columns = [];

				if (type === 'postgres') {
					// Query information_schema for column details + primary key info
					const cols = await queryRunner.query(
						`SELECT column_name, data_type, is_nullable,
             (SELECT COUNT(*) FROM information_schema.key_column_usage kcu
              JOIN information_schema.table_constraints tc
                ON kcu.constraint_name = tc.constraint_name
              WHERE tc.constraint_type = 'PRIMARY KEY'
                AND kcu.table_name = c.table_name
                AND kcu.column_name = c.column_name) as is_pk
             FROM information_schema.columns c
             WHERE table_name = $1
             ORDER BY ordinal_position;`,
						[table],
					);
					columns = cols.map((c) => ({
						name: c.column_name,
						type: c.data_type,
						nullable: c.is_nullable === 'YES',
						primaryKey: parseInt(c.is_pk) > 0,
					}));
				} else if (type === 'mysql') {
					// DESCRIBE is MySQL's shortcut to see column info
					const cols = await queryRunner.query(`DESCRIBE \`${table}\`;`);
					columns = cols.map((c) => ({
						name: c.Field,
						type: c.Type,
						nullable: c.Null === 'YES',
						primaryKey: c.Key === 'PRI',
					}));
				}

				schema[table] = columns;
			}
		} finally {
			await queryRunner.release();
		}

		return schema;
	}

	getDataSource({ userId, connectionId }) {
		const entry = this.pool.get(this.#key({ userId, connectionId }));
		if (!entry) throw new Error('No active connection. Please connect first.');
		return entry.dataSource;
	}

	getSchema({ userId, connectionId }) {
		const entry = this.pool.get(this.#key({ userId, connectionId }));
		if (!entry) throw new Error('No active connection.');
		return entry.schema;
	}

	getType({ userId, connectionId }) {
		const entry = this.pool.get(this.#key({ userId, connectionId }));
		return entry?.dbType;
	}

	isConnected({ userId, connectionId }) {
		return this.pool.has(this.#key({ userId, connectionId }));
	}

	async disconnect({ userId, connectionId }) {
		const key = this.#key({ userId, connectionId });
		const entry = this.pool.get(key);

		// Only destroy if the connection was actually initialized
		if (entry?.dataSource?.isInitialized) {
			await entry.dataSource.destroy();
		}

		this.pool.delete(key);
	}
}

export default new DBManager();
