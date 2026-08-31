import z from 'zod';

export const connectDbSchema = z.object({
	uri: z.string().min(1, 'URI is required'),
	name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
});

export const updateConnectionNameSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(50, 'Name too long')
		.transform((v) => v.trim()),
});
