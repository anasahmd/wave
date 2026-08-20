import { ChatOpenAI } from '@langchain/openai';

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
