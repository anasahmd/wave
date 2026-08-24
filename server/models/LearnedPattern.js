import mongoose from 'mongoose';

const learnedPatternSchema = new mongoose.Schema(
	{
		connection: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Connection',
			required: true,
			index: true,
		},
		question: {
			type: String,
			required: true,
			trim: true,
		},
		query: {
			type: String,
			required: true,
			trim: true,
		},
		embedding: {
			type: [Number],
			required: true,
		},
		usage_count: {
			type: Number,
			default: 0,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true },
);

learnedPatternSchema.set('toJSON', {
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

export default mongoose.model('LearnedPattern', learnedPatternSchema);
