import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Generate JWT for user
export function generateToken(user) {
	const id = user._id.toString();
	return jwt.sign({ id, email: user.email, name: user.name }, JWT_SECRET, {
		expiresIn: '7d',
	});
}
