import z from 'zod';

export const chatSchema = z.object({
	message: z.string().min(1, 'Message is required'),
	connectionId: z.string().min(1, 'connectionId is required'),
	threadId: z.string().nullable().optional(),
});

export const updateThreadTitleSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(100, 'Title too long')
		.transform((v) => v.trim()),
});
