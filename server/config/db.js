import mongoose from 'mongoose';

const configureDB = async () => {
	try {
		const db = await mongoose.connect(process.env.MONGO_URI);
		console.log(`Connected to DB: ${db.connection.name}`);
	} catch (e) {
		console.error('Fatal: Cannot connect to MongoDB', e);
		process.exit(1);
	}
};

export default configureDB;
