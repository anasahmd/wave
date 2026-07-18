import { generateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const authController = {};

authController.register = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(409).json({ error: 'Email already exists' });
		}

		const passwordHash = await bcrypt.hash(password, 12);

		let user = await User.create({ name, email, password_hash: passwordHash });

		const token = generateToken(user);

		res.status(201).json({
			token,
			user: { id: user._id, email: user.email, name: user.name },
		});
	} catch (e) {
		console.log(e);

		res.status(500).json({ error: 'Registration Failed' });
	}
};

authController.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });

		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		const validPassword = await bcrypt.compare(password, user.password_hash);

		if (!validPassword) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		const token = generateToken(user);

		res.status(201).json({
			token,
			user: { id: user._id, email: user.email, name: user.name },
		});
	} catch (e) {
		console.log(e);

		res.status(500).json({ error: 'Login Failed' });
	}
};

authController.me = async (req, res) => {
	const { id, email } = req.user;
	const user = await User.findById(id).select('-password_hash');

	if (!user) {
		return res.status(404).json({ error: 'User not found' });
	}

	res.json({
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			created_at: user.createdAt,
		},
	});
};

authController.changePassword = async (req, res) => {
	res.status(500).json({ error: 'Not implemented' });
};

authController.deleteAccount = async (req, res) => {
	res.status(500).json({ error: 'Not implemented' });
};

export default authController;
