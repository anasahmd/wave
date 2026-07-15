import mongoose from 'mongoose';

const configureDB = async () => {
	try {
		const db = await mongoose.connect(process.env.MONGO_URI);
		console.log(`Connected to DB: ${db.connection.name}`);
	} catch (e) {
		console.log('Error connecting to DB', e);
	}
};

export default configureDB;
