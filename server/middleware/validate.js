import { ZodError } from 'zod';

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (and coerced) result.
 * On failure, returns a 400 with structured error details.
 */

const validate = (schema) => (req, res, next) => {
	try {
		req.body = schema.parse(req.body);
		next();
	} catch (err) {
		if (err instanceof ZodError) {
			return res.status(400).json({
				error: 'Validation failed',
				details: err.issues.map((e) => ({
					field: e.path.join('.'),
					message: e.message,
				})),
			});
		}
		next(err);
	}
};

export default validate;
