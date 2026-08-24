import z from 'zod';

export const savePatternSchema = z.object({
	connectionId: z.string({ required_error: 'connectionId is required' }),
	question: z.string({ required_error: 'question is required' }),
	query: z.string({ required_error: 'query is required' }),
});

export const updatePatternSchema = z.object({
	question: z.string().optional(),
	query: z.string().optional(),
});
