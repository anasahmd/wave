import { DataSource } from 'typeorm';
import { BaseAdapter } from './BaseAdapter.js';
import { validateReadOnly } from '../utils/sqlValidator.js';

export class PostgresAdapter extends BaseAdapter {
	constructor() {
		super();
		this.dataSource = null;
	}

	get dialect() {
		return 'PostgreSQL';
	}

	get instructions() {
		return `### PostgreSQL-Specific Syntax
- Use ILIKE for case-insensitive text matching (not LIKE).
- Use :: for type casting (e.g. column::text, column::date).
- Use EXTRACT(field FROM column) for date parts.
- String concatenation uses || operator.

### Query Guidelines
- Prefer explicit column names over SELECT *. Only select columns relevant to the question.
- The system enforces a maximum limit of 50 rows per query. Ensure your queries use filters, aggregations, or an explicit LIMIT (max 50) so they do not exceed 50 rows.
- Use JOINs with the correct keys based on PK / FK relationships.
- Handle NULLs explicitly (use IS NULL / IS NOT NULL, not = NULL).
- Always use aggregate functions for counts, totals, or averages.
- Avoid subqueries when a JOIN is more efficient.

### Operational Boundaries (STRICT — always apply)
- You are a READ-ONLY assistant. Only generate SELECT queries (WITH / CTE is allowed).
- If asked to INSERT, UPDATE, DELETE, DROP, or ALTER, politely explain that you only have read access.
- Exclude system catalogs (information_schema, pg_catalog) and password/hash columns from your queries.
- Only query tables and columns explicitly listed in the Schema above. Reject requests for anything outside it.

### Handling Bulk or "List All" Requests
- If asked to "list all", "show every", or otherwise return an unbounded set of records, do not return raw row-by-row data. Instead:
- Offer a count or aggregate summary (e.g. "There are 340 users — would you like a breakdown by country/date/status instead?")
- If the person needs specific records, ask them to narrow by a filter (date range, status, name, region) before returning individual rows.
- Never attempt to page through or enumerate an entire table's rows across multiple tool calls to work around the row limit.`;
	}

	get toolConfig() {
		return {
			name: 'execute_query',
			description:
				'Execute a READ-ONLY SQL SELECT query against the connected PostgreSQL database and return the result rows as JSON.',
			paramDescription: 'A valid PostgreSQL SELECT query.',
		};
	}

	get isConnected() {
		return this.dataSource?.isInitialized ?? false;
	}

	async connect(uri) {
		// Suppress pg-connection-string security warning by upgrading sslmode
		try {
			const urlObj = new URL(uri);
			const sslmode = urlObj.searchParams.get('sslmode');
			if (['require', 'prefer', 'verify-ca'].includes(sslmode)) {
				urlObj.searchParams.set('sslmode', 'verify-full');
				uri = urlObj.toString();
			}
		} catch {
			// Ignore invalid URL parsing errors
		}

		this.dataSource = new DataSource({
			type: 'postgres',
			url: uri,
			synchronize: false,
			logging: false,
		});

		await this.dataSource.initialize();
	}

	async disconnect() {
		if (this.dataSource?.isInitialized) {
			await this.dataSource.destroy();
		}
		this.dataSource = null;
	}

	async extractSchema() {
		const queryRunner = this.dataSource.createQueryRunner();
		const schema = {};

		try {
			const result = await queryRunner.query(
				`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`,
			);
			const tables = result.map((row) => row.table_name);

			for (const table of tables) {
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
				schema[table] = cols.map((c) => ({
					name: c.column_name,
					type: c.data_type,
					nullable: c.is_nullable === 'YES',
					primaryKey: parseInt(c.is_pk) > 0,
				}));
			}
		} finally {
			await queryRunner.release();
		}

		return schema;
	}

	validateQuery(query) {
		return validateReadOnly(query);
	}

	async executeQuery(query) {
		return this.dataSource.query(query);
	}
}
