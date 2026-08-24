import LearnedPattern from '../models/LearnedPattern.js';
import { findDbConnection } from '../services/chatService.js';
import { createEmbeddingModel } from '../services/llmService.js';

const patternController = {};

patternController.addPattern = async (req, res) => {
	const { connectionId, question, query } = req.body;
	const userId = req.user.id;
	try {
		const { adapter } = await findDbConnection({ connectionId, userId });

		if (adapter) {
			const validation = await adapter.validateQuery(query);
			if (!validation.valid) {
				return res.status(400).json({ error: validation.reason });
			}
		}

		const embeddings = createEmbeddingModel();
		if (!embeddings) {
			return res.status(500).json({
				error:
					'Embedding provider is not configured. Unable to save pattern vector.',
			});
		}

		let queryEmbedding;
		try {
			queryEmbedding = await embeddings.embedQuery(question);
		} catch (err) {
			console.error('[Embedding Error]:', err.message);
			return res
				.status(500)
				.json({ error: `Embedding generation failed: ${err.message}` });
		}

		const pattern = await LearnedPattern.create({
			connection: connectionId,
			question: question.trim(),
			query: query.trim(),
			embedding: queryEmbedding,
			user: userId,
		});

		res.json(pattern);
	} catch (error) {
		console.error('Error saving pattern:', error);
		res.status(400).json({ error: error.message || 'Failed to save pattern' });
	}
};

patternController.getPatterns = async (req, res) => {
	const { connectionId } = req.params;

	try {
		const patterns = await LearnedPattern.find({ connection: connectionId })
			.select('-embedding')
			.sort({ createdAt: -1 });

		res.json(patterns);
	} catch (error) {
		console.error('Error fetching patterns:', error);
		res.status(500).json({ error: 'Failed to fetch patterns' });
	}
};

patternController.deletePattern = async (req, res) => {
	const { id } = req.params;

	try {
		const pattern = await LearnedPattern.findByIdAndDelete(id);

		if (!pattern) {
			return res.status(404).json({ error: 'Pattern not found' });
		}

		res.json(pattern);
	} catch (error) {
		console.error('Error deleting pattern:', error);
		res.status(500).json({ error: 'Failed to delete pattern' });
	}
};

patternController.updatePattern = async (req, res) => {
	const { id } = req.params;
	const { question, query } = req.body;
	const userId = req.user.id;

	try {
		const pattern = await LearnedPattern.findById(id);
		if (!pattern) {
			return res.status(404).json({ error: 'Pattern not found' });
		}

		// Validate query if it changed
		if (query && query.trim() !== pattern.query) {
			const { adapter } = await findDbConnection({
				connectionId: pattern.connection.toString(),
				userId,
			});
			if (adapter) {
				const validation = await adapter.validateQuery(query);
				if (!validation.valid) {
					return res.status(400).json({ error: validation.reason });
				}
			}
		}

		// Re-embed if question changed
		if (question && question.trim() !== pattern.question) {
			const embeddings = createEmbeddingModel();
			if (!embeddings) {
				return res.status(500).json({
					error:
						'Embedding provider is not configured. Unable to update pattern vector.',
				});
			}
			try {
				pattern.embedding = await embeddings.embedQuery(question.trim());
			} catch (err) {
				console.error('[Embedding Error]:', err.message);
				return res
					.status(500)
					.json({ error: `Embedding generation failed: ${err.message}` });
			}
		}

		if (question) pattern.question = question.trim();
		if (query) pattern.query = query.trim();
		await pattern.save();

		res.json(pattern);
	} catch (error) {
		console.error('Error updating pattern:', error);
		res.status(400).json({ error: error.message || 'Failed to update pattern' });
	}
};

export default patternController;
