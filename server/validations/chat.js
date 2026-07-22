import z from 'zod';

export const chatSchema = z.object({
	message: z.string().min(1, 'Message is required'),
	connectionId: z.string().min(1, 'connectionId is required'),
	threadId: z.string().optional(),
});
