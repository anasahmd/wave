import LearnedPattern from '../models/LearnedPattern.js';
import { createEmbeddingModel } from './llmService.js';
import mongoose from 'mongoose';

const MIN_RELEVANCE_SCORE = 0.6;

export async function getRelevantPatterns({
	connectionId,
	userQuestion,
	topK = 3,
}) {
	try {
		const embeddings = createEmbeddingModel();
		if (!embeddings) return [];

		let queryEmbedding;
		try {
			queryEmbedding = await embeddings.embedQuery(userQuestion);
		} catch (embedErr) {
			console.error(
				`[Embedding Error] Failed to generate query embedding using model "${process.env.EMBEDDING_MODEL || 'default'}":`,
				embedErr.message,
			);
			return [];
		}

		const connObjectId = new mongoose.Types.ObjectId(connectionId);

		const results = await LearnedPattern.aggregate([
			{
				$vectorSearch: {
					index: 'pattern_vector_index',
					path: 'embedding',
					queryVector: queryEmbedding,
					numCandidates: 50,
					limit: topK * 2,
					filter: { connection: connObjectId },
				},
			},
			{
				$project: {
					_id: 1,
					question: 1,
					query: 1,
					score: { $meta: 'vectorSearchScore' },
				},
			},
		]);

		if (!results?.length) return [];

		return results
			.filter((p) => (p.score ?? 0) >= MIN_RELEVANCE_SCORE)
			.slice(0, topK)
			.map((p) => ({
				id: p._id.toString(),
				question: p.question,
				query: p.query,
			}));
	} catch (err) {
		console.error('Pattern retrieval failed (failing open):', err.message);
		return [];
	}
}
