import mongoose from 'mongoose';
import { embedText } from '../services/llmService.js';

const INDEX_NAME = 'saved_query_vector_index';

/**
 * Auto-detects embedding dimensions by generating a test embedding,
 * then ensures a vector search index exists on the savedqueries collection.
 *
 * - On Atlas / Atlas Local: creates the index automatically via createSearchIndex.
 * - On standalone mongod: logs a warning (vector search won't be available).
 */
export async function ensureVectorIndex() {
	// Auto-detect dimensions from the configured embedding model
	let vectorSize;
	try {
		const testEmbedding = await embedText('test');
		vectorSize = testEmbedding.length;
		console.log(
			`[vector] Detected embedding dimensions: ${vectorSize}`,
		);
	} catch (err) {
		console.warn(
			'[vector] Could not detect embedding dimensions (embedding model not configured?):',
			err.message,
		);
		console.warn(
			'[vector] Saved query similarity search will be unavailable.',
		);
		return;
	}

	const collection = mongoose.connection.db.collection('savedqueries');

	// Check if index already exists
	try {
		const indexes = await collection
			.listSearchIndexes(INDEX_NAME)
			.toArray();
		if (indexes.length > 0) {
			console.log(`[vector] Index "${INDEX_NAME}" already exists`);
			return;
		}
	} catch {
		// listSearchIndexes may fail on non-Atlas; proceed to create
	}

	// Attempt to create the index
	try {
		await collection.createSearchIndex({
			name: INDEX_NAME,
			type: 'vectorSearch',
			definition: {
				fields: [
					{
						type: 'vector',
						path: 'embedding',
						numDimensions: vectorSize,
						similarity: 'cosine',
					},
					{
						type: 'filter',
						path: 'connection',
					},
				],
			},
		});
		console.log(
			`[vector] Created "${INDEX_NAME}" with ${vectorSize} dimensions`,
		);
	} catch (err) {
		console.warn(
			'[vector] Could not create vector index (non-Atlas?):',
			err.message,
		);
		console.warn(
			'[vector] Saved query similarity search will be unavailable. Create the index manually via Atlas UI or Compass.',
		);
	}
}
