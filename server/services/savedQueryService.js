import SavedQuery from '../models/SavedQuery.js';
import { embedText } from './llmService.js';
import mongoose from 'mongoose';

const MIN_RELEVANCE_SCORE = 0.6;

export async function getRelevantSavedQueries({
	connectionId,
	userQuestion,
	topK = 3,
}) {
	try {
		const queryEmbedding = await embedText(userQuestion);

		const connObjectId = new mongoose.Types.ObjectId(connectionId);

		const results = await SavedQuery.aggregate([
			{
				$vectorSearch: {
					index: 'saved_query_vector_index',
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
		console.error('Saved query retrieval failed (failing open):', err.message);
		return [];
	}
}
