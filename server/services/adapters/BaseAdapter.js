export class BaseAdapter {
	// Returns dialect of the database (e.g., "PostgreSQL", "MySQL", "MongoDB")
	get dialect() {
		throw new Error('Not implemented');
	}

	// Specific instructions for each dialect, injected in the system prompt
	get instructions() {
		throw new Error('Not implemented');
	}

	// Used to create langchain tools, returns { name, description, paramDescription }
	get toolConfig() {
		throw new Error('Not implemented');
	}

	// Returns boolean
	get isConnected() {
		throw new Error('Not implemented');
	}

	// Connect to the database using the given URI
	async connect(uri) {
		throw new Error('Not implemented');
	}

	// Disconnect form the database
	async disconnect() {
		throw new Error('Not implemented');
	}

	// Extract the schema for context
	async extractSchema() {
		throw new Error('Not implemented');
	}

	// Validates that the query is read only
	validateQuery(query) {
		throw new Error('Not implemented');
	}

	// returns arrays of rows after successful execution
	async executeQuery(query) {
		throw new Error('Not implemented');
	}
}
