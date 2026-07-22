import { createAgent, tool } from 'langchain';
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';

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

	const dialect = dbType === 'postgres' ? 'PostgreSQL' : 'MySQL';

	const executeSQL = tool()
}
