import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		encrypted_uri: {
			type: String,
			required: true,
		},
		db_type: {
			type: String,
			required: true,
			enum: ['postgres', 'mysql', 'better-sqlite3'],
		},
	},
	{ timestamps: true },
);

export default mongoose.model('Connection', connectionSchema);
