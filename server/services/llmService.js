import { ChatOpenAI } from '@langchain/openai';

export const createLLM = () => {
	const baseURL = process.env.LLM_BASE_URL;
	const apiKey = process.env.LLM_API_KEY;
	const model = process.env.LLM_MODEL;

	if (!baseURL || !apiKey || !model) {
		throw new Error(
			'LLM not configured. Set LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL in .env',
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
