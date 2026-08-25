import z from 'zod';

export const saveSavedQuerySchema = z.object({
	connectionId: z.string({ required_error: 'connectionId is required' }),
	question: z.string({ required_error: 'question is required' }).trim(),
	query: z.string({ required_error: 'query is required' }).trim(),
});

export const updateSavedQuerySchema = z.object({
	question: z.string().trim().optional(),
	query: z.string().trim().optional(),
});
