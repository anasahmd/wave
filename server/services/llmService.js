import { ChatGroq } from '@langchain/groq';
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';

export const createLLM = () => {
	// if (
	// 	!process.env.GROQ_API_KEY ||
	// 	process.env.GROQ_API_KEY === 'your_groq_api_key'
	// ) {
	// 	throw new Error('GROQ_API_KEY is missing or invalid in .env');
	// }
	// return new ChatGroq({
	// 	model: 'llama-3.1-8b-instant',
	// 	temperature: 0,
	// 	apiKey: process.env.GROQ_API_KEY,
	// });
	const baseUrl = 'http://localhost:1234/v1';
	const model = 'qwen_qwen3.5-4b';

	return new ChatOpenAI({
		model: model,
		temperature: 0,
		apiKey: 'lm-studio',
		configuration: {
			baseURL: baseUrl,
		},
	});
};
