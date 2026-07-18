import z from 'zod';

export const connectDbSchema = z.object({
	uri: z.string().min(1, 'Connection URI is required'),
	name: z
		.string()
		.min(1, 'Connection name is required')
		.max(100, 'Name too long'),
});
