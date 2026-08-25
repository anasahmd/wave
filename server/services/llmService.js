import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

export const createLLM = () => {
	const baseURL = process.env.LLM_BASE_URL;
	const apiKey = process.env.LLM_API_KEY;
	const model = process.env.LLM_MODEL;

	if (!baseURL || !apiKey || !model) {
		throw new Error(
			'LLM connection is not enabled. Please check your LLM configuration in .env.',
		);
	}

	return new ChatOpenAI({
		model,
		temperature: 0,
		apiKey,
		maxRetries: 1,
		configuration: {
			baseURL,
		},
	});
};

export const createEmbeddingModel = () => {
	const baseURL = process.env.EMBEDDING_BASE_URL || process.env.LLM_BASE_URL;
	const apiKey = process.env.EMBEDDING_API_KEY || process.env.LLM_API_KEY;
	const model = process.env.EMBEDDING_MODEL;

	if (!apiKey) {
		return null;
	}

	return new OpenAIEmbeddings({
		model,
		apiKey,
		maxRetries: 1,
		encodingFormat: 'float',
		configuration: {
			baseURL,
		},
	});
};

export async function embedText(text) {
	const embeddings = createEmbeddingModel();
	if (!embeddings) {
		throw new Error('Embedding provider is not configured.');
	}
	try {
		return await embeddings.embedQuery(text);
	} catch (err) {
		console.error('[Embedding Error]:', err.message);
		throw new Error('Failed to generate embedding.');
	}
}
