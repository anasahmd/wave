import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import configureDB from './config/db.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import { authenticate } from './middleware/auth.js';
import connectionRouter from './routes/connection.js';
import morgan from 'morgan';
import chatRouter from './routes/chat.js';
import savedQueryRouter from './routes/savedQuery.js';
import { cleanupGuestUsers } from './jobs/guestCleanup.js';
import { ensureVectorIndex } from './config/vectorIndex.js';

const PORT = process.env.PORT || 5000;

const app = express();
await configureDB();
await ensureVectorIndex();

// Guest user cleanup: run on startup + every 6 hours
cleanupGuestUsers();
setInterval(cleanupGuestUsers, 6 * 60 * 60 * 1000);

app.use(cors({
	origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json());

//logging
app.use(morgan('dev'));

app.use('/api/auth', authRouter);
app.use('/api/users', authenticate, userRouter);
app.use('/api/connections', authenticate, connectionRouter);
app.use('/api/chats', authenticate, chatRouter);
app.use('/api/saved-queries', authenticate, savedQueryRouter);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status || 500).json({
		error: err.message || 'Internal server error',
	});
});

app.listen(PORT, () => {
	console.log(`Server running on PORT: ${PORT}`);
});
