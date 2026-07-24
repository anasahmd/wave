import { createAgent, tool } from 'langchain';
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';
import { validateReadOnly } from '../utils/sqlValidator.js';
import z from 'zod';
import mongoose from 'mongoose';

let checkpointer;
function getCheckpointer() {
	if (!checkpointer) {
		checkpointer = new MongoDBSaver({
			client: mongoose.connection.getClient(),
		});
	}
	return checkpointer;
}

// Converts schema object into a readable string for the AI prompt
// Minimizes token usage by removing JSON artifacts
function formatSchema(schema) {
	return Object.entries(schema)
		.map(([tableName, columns]) => {
			const columnLines = columns.map((col) => {
				const pk = col.primaryKey ? ' PK' : '';
				const nullable = col.nullable ? '' : ' NOT NULL';
				return `  ${col.name} ${col.type}${pk}${nullable}`;
			});
			return `${tableName}:\n${columnLines.join('\n')}`;
		})
		.join('\n\n');
}

export function createSqlAgent({ model, dataSource, schema }) {
	const dbType = dataSource.options?.type;

	const dialect =
		dbType === 'postgres'
			? 'PostgreSQL'
			: dbType === 'mysql'
				? 'MySQL'
				: 'SQLite';

	const executeSql = tool(
		async ({ query }) => {
			const validation = validateReadOnly(query);
			if (!validation.valid) {
				throw new Error(validation.reason);
			}

			try {
				const safeQuery = `SELECT * FROM (${query}) AS _limited LIMIT 51`;
				const rows = await dataSource.query(safeQuery);

				if (rows.length > 50) {
					throw new Error(
						`Query returned more than 50 rows. ` +
							`Rewrite using aggregate functions (COUNT, SUM, AVG) or add a LIMIT clause.`,
					);
				}
				return JSON.stringify(rows, null, 2);
			} catch (err) {
				throw new Error(`SQL Error: ${err.message}`);
			}
		},
		{
			name: 'execute_sql',
			description:
				'Execute a READ-ONLY SQL SELECT query against the connected database ' +
				'and return the result rows as JSON.',
			schema: z.object({
				query: z.string().describe(`A valid ${dialect} SELECT query.`),
			}),
		},
	);

	const dialectHints = {
		PostgreSQL: `
		- Use ILIKE for case-insensitive text matching (not LIKE).
		- Use :: for type casting (e.g. column::text, column::date).
		- Use EXTRACT(field FROM column) for date parts.
		- String concatenation uses || operator.`,
		MySQL: `- Use LIKE with LOWER() for case-insensitive matching, or rely on the collation.
		- Use CAST(column AS type) for type casting.
		- Use backticks around reserved-word identifiers.
		- String concatenation uses CONCAT() function.`,
	};

	const systemPrompt = `You are Wave, an expert database analyst. You help users explore and understand their data using natural language.

		## Database Context

		Dialect: ${dialect}

		Schema:
		${formatSchema(schema)}

		${dialectHints[dialect] ? `### ${dialect}-Specific Syntax\n${dialectHints[dialect]}` : ''}

		## Workflow

		1. **Understand**: Read the user's question carefully. Identify which tables and columns are relevant by consulting the schema above.
		2. **Clarify**: If the question is ambiguous, vague, or could map to multiple tables/columns, ask ONE focused follow-up question BEFORE writing any SQL. Never guess.
		3. **Query**: When you have enough information, call the \`execute_sql\` tool with a single SELECT query.
		4. **Summarise**: After receiving results, provide a clear natural-language answer with the key numbers. Cite the specific data — don't just say "some" or "a few".

		## SQL Guidelines

		- Only generate read-only SELECT queries. WITH / CTE is allowed.
		- Always consult the schema above before writing SQL. Never reference a table or column that is not listed.
		- Prefer explicit column names over SELECT *. Only select columns relevant to the question.
		- Default to LIMIT 20 unless the user asks for more.
		- Use JOINs with the correct keys — check PK / FK relationships in the schema.
		- Handle NULLs explicitly when filtering (use IS NULL / IS NOT NULL, not = NULL).
		- For counts, totals, or averages always use aggregate functions — never count rows client-side.
		- Avoid subqueries when a JOIN achieves the same result more efficiently.

		## Response Format

		- Use a **markdown table** when the result has 3+ columns or 3+ rows.
		- Use **bold numbers** for single-value answers (e.g. "Total revenue: **$12,340**").
		- Use bullet points for lists of 2-5 items.
		- Keep summaries concise — lead with the answer, then add context.
		- Never expose raw JSON or SQL errors to the user. Translate errors into plain language.

		## Error Handling

		- If \`execute_sql\` returns an error, read the message, fix the query, and retry (max 3 attempts).
		- After 3 failed attempts, stop and tell the user what went wrong in plain language. Suggest how they might rephrase their question.
		- Never retry with the exact same query — always change something.`;

	return createAgent({
		model,
		tools: [executeSql],
		checkpointer: getCheckpointer(),
		systemPrompt,
	});
}

export async function invokeAgent({ agent, message, threadId }) {
	const result = await agent.invoke(
		{
			messages: [{ role: 'user', content: message }],
		},
		{ configurable: { thread_id: threadId } },
	);

	console.log(result);

	const allMessages = result.messages;
	const lastMessage = allMessages[allMessages.length - 1];
	const answer = lastMessage.content;

	const executedQueries = allMessages
		.flatMap((msg) => msg.tool_calls ?? [])
		.filter((call) => call.name === 'execute_sql')
		.map((call) => call.args.query);

	return { answer, executedQueries };
}
