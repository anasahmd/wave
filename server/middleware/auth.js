import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Generate JWT for user
export function generateToken(user) {
	const id = user._id.toString();
	return jwt.sign({ id, email: user.email, name: user.name }, JWT_SECRET, {
		expiresIn: '7d',
	});
}

// Verifies bearer token and attach user to req object
export function authenticate(req, res, next) {
	const header = req.headers.authorization;
	if (!header?.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const token = header.split(' ')[1];
		const payload = jwt.verify(token, JWT_SECRET);

		req.user = { id: payload.id, email: payload.email };
		next();
	} catch {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}
