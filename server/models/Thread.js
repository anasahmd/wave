import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
	{
		role: {
			type: String,
			required: true,
			enum: ['user', 'assistant'],
		},
		content: {
			type: String,
			required: true,
		},
		query_used: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true },
);

const threadSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		connection: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Connection',
			required: true,
			index: true,
		},
		title: {
			type: String,
			default: 'New Chat',
		},
		messages: [messageSchema],
		pinned: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

threadSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		returnedObject.created_at = returnedObject.createdAt;
		returnedObject.updated_at = returnedObject.updatedAt;

		delete returnedObject._id;
		delete returnedObject.__v;
		delete returnedObject.createdAt;
		delete returnedObject.updatedAt;
	},
});

messageSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		returnedObject.created_at = returnedObject.createdAt;

		delete returnedObject._id;
		delete returnedObject.__v;
		delete returnedObject.createdAt;
		delete returnedObject.updatedAt;
	},
});

export default mongoose.model('Thread', threadSchema);
