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
		sql_query: {
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
	},
	{ timestamps: true },
);

threadSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

export default mongoose.model('Thread', threadSchema);
