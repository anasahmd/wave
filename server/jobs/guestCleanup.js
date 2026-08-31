import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Thread from '../models/Thread.js';
import SavedQuery from '../models/SavedQuery.js';
import mongoose from 'mongoose';

const GUEST_TTL_MS =
	parseInt(process.env.GUEST_TTL_HOURS || '24', 10) * 60 * 60 * 1000;

export async function cleanupGuestUsers() {
	const cutoff = new Date(Date.now() - GUEST_TTL_MS);

	const guests = await User.find({
		email: { $regex: /@wave\.local$/ },
		createdAt: { $lt: cutoff },
	});

	if (guests.length === 0) return;

	console.log(`[cleanup] Found ${guests.length} expired guest(s)`);

	for (const guest of guests) {
		const threads = await Thread.find({ user: guest._id }, { _id: 1 });
		const threadIds = threads.map((t) => t._id.toString());

		await Thread.deleteMany({ user: guest._id });
		await SavedQuery.deleteMany({ user: guest._id });
		await Connection.deleteMany({ user: guest._id });

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

		await guest.deleteOne();
		console.log(`[cleanup] Removed guest: ${guest.email}`);
	}
}
