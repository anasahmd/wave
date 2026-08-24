import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import configureDB from './config/db.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import { authenticate } from './middleware/auth.js';
import connectionRouter from './routes/connection.js';
import morgan from 'morgan';
import { createStream } from 'rotating-file-stream';
import path from 'path';
import chatRouter from './routes/chat.js';
import patternRouter from './routes/pattern.js';

const PORT = process.env.PORT || 5000;

const app = express();
configureDB();

app.use(cors());
app.use(express.json());

//logging
const accessLogStream = createStream('access.log', {
	interval: '1d', // rotate daily
	path: path.join(import.meta.dirname, 'logs'),
});

app.use(morgan('combined', { stream: accessLogStream }));

app.use('/api/auth', authRouter);
app.use('/api/users', authenticate, userRouter);
app.use('/api/connections', authenticate, connectionRouter);
app.use('/api/chats', authenticate, chatRouter);
app.use('/api/patterns', authenticate, patternRouter);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status || 500).json({
		error: err.message || 'Internal server error',
	});
});

app.listen(PORT, () => {
	console.log(`Server running on PORT: ${PORT}`);
});
