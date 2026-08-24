import { MongoClient } from 'mongodb';
import { BaseAdapter } from './BaseAdapter.js';

// Number of documents to sample per collection when inferring schema
const SCHEMA_SAMPLE_SIZE = 20;

export class MongoAdapter extends BaseAdapter {
	constructor() {
		super();
		this.client = null;
		this.db = null;
	}

	get dialect() {
		return 'MongoDB';
	}

	get instructions() {
		return `### MongoDB Query Syntax
- Queries must be valid JSON objects. Do NOT write SQL.
- Format: { "collection": "<name>", "operation": "<op>", "pipeline": [...] } or { "collection": "<name>", "operation": "find", "filter": {...}, "projection": {...} }
- Supported operations: "find", "aggregate", "countDocuments"

### Operation Examples
- Find: { "collection": "users", "operation": "find", "filter": { "age": { "$gte": 18 } }, "projection": { "name": 1, "email": 1 } }
- Aggregate: { "collection": "orders", "operation": "aggregate", "pipeline": [{ "$group": { "_id": "$status", "count": { "$sum": 1 } } }] }
- Count: { "collection": "users", "operation": "countDocuments", "filter": { "active": true } }

### Query Guidelines
- Prefer projections to limit returned fields. Only include fields relevant to the question.
- The system enforces a maximum limit of 50 documents per query. Ensure your queries use filters, aggregations, or explicit limits ($limit <= 50) so they do not exceed 50 documents.
- Use $match early in aggregation pipelines to reduce the working set.
- Use $group with $sum, $avg, $min, $max for aggregations.
- Use $sort for top-N queries.
- Use $lookup for joining data across collections.

### Operational Boundaries (STRICT — always apply)
- You are a READ-ONLY assistant. Only use find, aggregate, and countDocuments operations.
- If asked to insert, update, delete, or drop, politely explain that you only have read access.
- Exclude password, hash, and token fields from your projections.
- Only query collections and fields explicitly listed in the Schema above. Reject requests for anything outside it.

### Handling Bulk or "List All" Requests
- If asked to "list all", "show every", or otherwise return an unbounded set of records, do not return raw document-by-document data. Instead:
- Offer a count or aggregate summary (e.g. "There are 340 users — would you like a breakdown by status/date instead?")
- If the person needs specific records, ask them to narrow by a filter before returning individual documents.
- Never attempt to page through an entire collection.`;
	}

	get toolConfig() {
		return {
			name: 'execute_query',
			description:
				'Execute a READ-ONLY MongoDB query (find, aggregate, or countDocuments) against the connected database and return the result documents as JSON.',
			paramDescription:
				'A valid MongoDB query as a JSON string. Must include "collection", "operation", and the relevant parameters (filter, projection, pipeline).',
		};
	}

	get isConnected() {
		return this.client !== null;
	}

	async connect(uri) {
		this.client = new MongoClient(uri);
		await this.client.connect();

		// Extract db name from URI, default to 'test'
		const url = new URL(uri);
		const dbName = url.pathname.slice(1).split('?')[0] || 'test';
		this.db = this.client.db(dbName);
	}

	async disconnect() {
		if (this.client) {
			await this.client.close();
		}
		this.client = null;
		this.db = null;
	}

	/**
	 * Infers schema by sampling documents from each collection.
	 * Since MongoDB is schema-less, we sample N documents per collection
	 * and merge their fields to build an approximate schema.
	 */
	async extractSchema() {
		const schema = {};
		const collections = await this.db
			.listCollections({}, { nameOnly: true })
			.toArray();

		for (const { name } of collections) {
			// Skip system collections
			if (name.startsWith('system.')) continue;

			const sample = await this.db
				.collection(name)
				.find({})
				.limit(SCHEMA_SAMPLE_SIZE)
				.toArray();

			if (sample.length === 0) {
				schema[name] = [];
				continue;
			}

			// Merge all field names and infer types from sampled documents
			const fieldMap = {};
			for (const doc of sample) {
				this.#extractFields(doc, fieldMap);
			}

			schema[name] = Object.entries(fieldMap).map(([fieldName, type]) => ({
				name: fieldName,
				type,
				nullable: true,
				primaryKey: fieldName === '_id',
			}));
		}

		return schema;
	}

	/**
	 * Recursively extract field names and types from a document.
	 * Nested objects are flattened using dot notation (e.g., "address.city").
	 */
	#extractFields(doc, fieldMap, prefix = '') {
		for (const [key, value] of Object.entries(doc)) {
			const fieldName = prefix ? `${prefix}.${key}` : key;

			if (value === null || value === undefined) {
				if (!fieldMap[fieldName]) fieldMap[fieldName] = 'null';
			} else if (Array.isArray(value)) {
				fieldMap[fieldName] = 'array';
			} else if (value instanceof Date) {
				fieldMap[fieldName] = 'date';
			} else if (typeof value === 'object' && !(value._bsontype)) {
				// Recurse into plain objects, skip BSON types like ObjectId
				fieldMap[fieldName] = 'object';
				this.#extractFields(value, fieldMap, fieldName);
			} else {
				fieldMap[fieldName] = typeof value;
			}
		}
	}

	validateQuery(query) {
		try {
			const parsed = JSON.parse(query);

			if (!parsed.collection || typeof parsed.collection !== 'string') {
				return { valid: false, reason: 'Query must include a "collection" field.' };
			}

			const allowedOps = ['find', 'aggregate', 'countDocuments'];
			if (!allowedOps.includes(parsed.operation)) {
				return {
					valid: false,
					reason: `Only read operations are allowed (find, aggregate, countDocuments). Got: "${parsed.operation}".`,
				};
			}

			// Check for write stages in aggregation pipelines
			if (parsed.operation === 'aggregate' && Array.isArray(parsed.pipeline)) {
				const writeStages = ['$out', '$merge'];
				for (const stage of parsed.pipeline) {
					const stageKey = Object.keys(stage)[0];
					if (writeStages.includes(stageKey)) {
						return {
							valid: false,
							reason: `Write stage "${stageKey}" is not allowed. Only read operations are permitted.`,
						};
					}
				}
			}

			return { valid: true };
		} catch {
			return { valid: false, reason: 'Query must be valid JSON.' };
		}
	}

	async executeQuery(query) {
		const parsed = JSON.parse(query);
		const collection = this.db.collection(parsed.collection);

		switch (parsed.operation) {
			case 'find': {
				const filter = parsed.filter || {};
				const projection = parsed.projection || {};
				return collection
					.find(filter, { projection })
					.limit(51)
					.toArray();
			}

			case 'aggregate': {
				const pipeline = parsed.pipeline || [];
				// Append $limit if not already present at the end
				const lastStage = pipeline[pipeline.length - 1];
				if (!lastStage || !lastStage.$limit) {
					pipeline.push({ $limit: 51 });
				}
				return collection.aggregate(pipeline).toArray();
			}

			case 'countDocuments': {
				const filter = parsed.filter || {};
				const count = await collection.countDocuments(filter);
				return [{ count }];
			}

			default:
				throw new Error(`Unsupported operation: ${parsed.operation}`);
		}
	}
}
