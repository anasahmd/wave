import nodeSqlParser from 'node-sql-parser';
const { Parser } = nodeSqlParser;

const parser = new Parser();
const ALLOWED_TYPES = ['select'];

// Validate that a SQL query is read-only (SELECT only)
// Returns { valid: true } or { valid: false, reason: string }
export function validateReadOnly(sql) {
	let ast;

	try {
		ast = parser.astify(sql);
	} catch (err) {
		return { valid: false, reason: `Invalid SQL syntax: ${err.message}` };
	}

	// parser.astify returns an array for multi-statement SQL
	const statements = Array.isArray(ast) ? ast : [ast];

	// prevents sql injection (piggybacking)
	if (statements.length > 1) {
		return { valid: false, reason: 'Multiple SQL statements are not allowed.' };
	}

	const stmtType = statements[0].type?.toLowerCase();

	if (!ALLOWED_TYPES.includes(stmtType)) {
		return {
			valid: false,
			reason: `Only SELECT queries are allowed. Got: ${stmtType?.toUpperCase() || 'UNKNOWN'}.`,
		};
	}

	return { valid: true };
}
