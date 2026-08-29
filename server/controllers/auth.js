import { generateToken } from '../middleware/auth.js';
import Connection from '../models/Connection.js';
import Thread from '../models/Thread.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dbManager from '../services/dbManager.js';
import mongoose from 'mongoose';

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
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				created_at: user.createdAt,
			},
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

		res.status(200).json({
			token,
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				created_at: user.createdAt,
			},
		});
	} catch (e) {
		console.log(e);

		res.status(500).json({ error: 'Login Failed' });
	}
};

authController.me = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password_hash');

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json({
			id: user._id,
			email: user.email,
			name: user.name,
			created_at: user.createdAt,
		});
	} catch (e) {
		console.log(e);

		res.status(500).json({ error: 'Failed to fetch user data' });
	}
};

authController.guestLogin = async (req, res) => {
	try {
		const guestId = crypto.randomUUID().slice(0, 8);
		const user = await User.create({
			name: `Guest-${guestId}`,
			email: `guest-${guestId}@wave.local`,
			password_hash: await bcrypt.hash(crypto.randomUUID(), 4),
		});

		const token = generateToken(user);
		res.json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				created_at: user.createdAt,
			},
		});
	} catch (error) {
		console.error('Gues login failed', error);
		res.status(500).json({ error: 'Guest login failed' });
	}
};

authController.changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		const user = await User.findById(req.user.id);
		if (!user) return res.status(404).json({ error: 'User not found' });

		const validPassword = await bcrypt.compare(
			currentPassword,
			user.password_hash,
		);
		if (!validPassword) {
			return res.status(400).json({ error: 'Current password is incorrect' });
		}

		user.password_hash = await bcrypt.hash(newPassword, 12);
		await user.save();

		res.json({ message: 'Password updated successfully' });
	} catch (error) {
		console.error('Change password error:', error);
		res.status(500).json({ error: 'Failed to change password' });
	}
};

authController.updateProfile = async (req, res) => {
	try {
		const { name, email } = req.body;

		// Check if email is already taken by another user
		const existingUser = await User.findOne({
			email,
			_id: { $ne: req.user.id },
		});
		if (existingUser) {
			return res.status(409).json({ error: 'Email already in use' });
		}

		const user = await User.findByIdAndUpdate(
			req.user.id,
			{ name: name.trim(), email: email.trim().toLowerCase() },
			{ returnDocument: 'after' },
		).select('-password_hash');

		if (!user) return res.status(404).json({ error: 'User not found' });

		res.json({
			id: user._id,
			name: user.name,
			email: user.email,
			created_at: user.createdAt,
		});
	} catch (error) {
		console.error('Update profile error:', error);
		res.status(500).json({ error: 'Failed to update profile' });
	}
};

authController.deleteAccount = async (req, res) => {
	try {
		const { password } = req.body;
		const user = await User.findById(req.user.id);
		if (!user) return res.status(404).json({ error: 'User not found' });
		const valid = await bcrypt.compare(password, user.password_hash);
		if (!valid) return res.status(400).json({ error: 'Incorrect password' });
		// Clean up connections, threads, checkpoints
		const connections = await Connection.find({ user: user._id });
		for (const conn of connections) {
			await dbManager.disconnect({
				userId: user._id.toString(),
				connectionId: conn._id.toString(),
			});
		}
		const threads = await Thread.find({ user: user._id }, { _id: 1 });
		const threadIds = threads.map((t) => t._id.toString());

		await Thread.deleteMany({ user: user._id });

		if (threadIds.length > 0) {
			const db = mongoose.connection.db;
			await Promise.all([
				db
					.collection('checkpoints')
					.deleteMany({ thread_id: { $in: threadIds } }),
				db
					.collection('checkpoint_writes')
					.deleteMany({ thread_id: { $in: threadIds } }),
				db
					.collection('checkpoint_blobs')
					.deleteMany({ thread_id: { $in: threadIds } }),
			]);
		}
		await Connection.deleteMany({ user: user._id });
		await user.deleteOne();
		res.json({ message: 'Account deleted' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete account' });
	}
};

export default authController;
