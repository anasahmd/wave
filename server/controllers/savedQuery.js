import SavedQuery from '../models/SavedQuery.js';
import { findDbConnection } from '../services/chatService.js';
import { embedText } from '../services/llmService.js';

const savedQueryController = {};

savedQueryController.addSavedQuery = async (req, res) => {
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

		const queryEmbedding = await embedText(question);

		const savedQuery = await SavedQuery.create({
			connection: connectionId,
			question,
			query,
			embedding: queryEmbedding,
			user: userId,
		});

		res.json(savedQuery);
	} catch (error) {
		console.error('Error saving query:', error);
		res.status(400).json({ error: error.message || 'Failed to save query' });
	}
};

savedQueryController.getSavedQueries = async (req, res) => {
	const { connectionId } = req.params;

	try {
		const queries = await SavedQuery.find({ connection: connectionId })
			.select('-embedding')
			.sort({ createdAt: -1 });

		res.json(queries);
	} catch (error) {
		console.error('Error fetching saved queries:', error);
		res.status(500).json({ error: 'Failed to fetch saved queries' });
	}
};

savedQueryController.deleteSavedQuery = async (req, res) => {
	const { id } = req.params;

	try {
		const savedQuery = await SavedQuery.findOneAndDelete({
			_id: id,
			user: req.user.id,
		});

		if (!savedQuery) {
			return res.status(404).json({ error: 'Saved query not found' });
		}

		res.json(savedQuery);
	} catch (error) {
		console.error('Error deleting saved query:', error);
		res.status(500).json({ error: 'Failed to delete saved query' });
	}
};

savedQueryController.updateSavedQuery = async (req, res) => {
	const { id } = req.params;
	const { question, query } = req.body;
	const userId = req.user.id;

	try {
		const savedQuery = await SavedQuery.findOne({ _id: id, user: userId });
		if (!savedQuery) {
			return res.status(404).json({ error: 'Saved query not found' });
		}

		// Validate query if it changed
		if (query && query !== savedQuery.query) {
			const { adapter } = await findDbConnection({
				connectionId: savedQuery.connection.toString(),
				userId,
			});
			if (adapter) {
				const validation = await adapter.validateQuery(query);
				if (!validation.valid) {
					return res.status(400).json({ error: validation.reason });
				}
			}
		}

		if (question && question !== savedQuery.question) {
			const queryEmbedding = await embedText(question);
			savedQuery.embedding = queryEmbedding;
		}

		if (question) savedQuery.question = question;
		if (query) savedQuery.query = query;
		await savedQuery.save();

		res.json(savedQuery);
	} catch (error) {
		console.error('Error updating saved query:', error);
		res.status(400).json({ error: error.message || 'Failed to update saved query' });
	}
};

export default savedQueryController;
