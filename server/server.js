import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import configureDB from './config/db.js';
import authRouter from './routes/auth.js';
import { authenticate } from './middleware/auth.js';
import connectionRouter from './routes/connection.js';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 5000;

const app = express();
configureDB();

app.use(cors());
app.use(express.json());

//logging
var accessLogStream = fs.createWriteStream(
	path.join(import.meta.dirname, 'access.log'),
	{
		flags: 'a',
	},
);
app.use(morgan('combined', { stream: accessLogStream }));

app.use('/api/auth', authRouter);
app.use('/api/connection', authenticate, connectionRouter);

app.listen(PORT, () => {
	console.log(`Server running on PORT: ${PORT}`);
});
