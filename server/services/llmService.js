import { ChatGroq } from '@langchain/groq';

export const createLLM = () => {
	if (
		!process.env.GROQ_API_KEY ||
		process.env.GROQ_API_KEY === 'your_groq_api_key'
	) {
		throw new Error('GROQ_API_KEY is missing or invalid in .env');
	}
	return new ChatGroq({
		model: 'llama-3.3-70b-versatile',
		temperature: 0,
		apiKey: process.env.GROQ_API_KEY,
	});
};
