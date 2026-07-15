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

		let user = await User.create({ name, email, passwordHash });

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
	res.status(500).json({ error: 'Not implemented' });
};

authController.me = async (req, res) => {
	res.status(500).json({ error: 'Not implemented' });
};

authController.changePassword = async (req, res) => {
	res.status(500).json({ error: 'Not implemented' });
};

authController.deleteAccount = async (req, res) => {
	res.status(500).json({ error: 'Not implemented' });
};

export default authController;
