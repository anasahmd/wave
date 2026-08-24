import { DataSource } from 'typeorm';
import { BaseAdapter } from './BaseAdapter.js';
import { validateReadOnly } from '../../utils/sqlValidator.js';

export class MySQLAdapter extends BaseAdapter {
	constructor() {
		super();
		this.dataSource = null;
	}

	get dialect() {
		return 'MySQL';
	}

	get instructions() {
		return `### MySQL-Specific Syntax
- Use LIKE with LOWER() for case-insensitive matching, or rely on the collation.
- Use CAST(column AS type) for type casting.
- Use backticks around reserved-word identifiers.
- String concatenation uses CONCAT() function.

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
- Exclude system catalogs (information_schema) and password/hash columns from your queries.
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
				'Execute a READ-ONLY SQL SELECT query against the connected MySQL database and return the result rows as JSON.',
			paramDescription: 'A valid MySQL SELECT query.',
		};
	}

	get isConnected() {
		return this.dataSource?.isInitialized ?? false;
	}

	async connect(uri) {
		this.dataSource = new DataSource({
			type: 'mysql',
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
			const result = await queryRunner.query(`SHOW TABLES;`);
			// MySQL returns rows like { Tables_in_dbname: "users" }
			// so we grab the first value from each row
			const tables = result.map((row) => Object.values(row)[0]);

			for (const table of tables) {
				// DESCRIBE is MySQL's shortcut to see column info
				const cols = await queryRunner.query(`DESCRIBE \`${table}\`;`);
				schema[table] = cols.map((c) => ({
					name: c.Field,
					type: c.Type,
					nullable: c.Null === 'YES',
					primaryKey: c.Key === 'PRI',
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
