import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import middleware from './utils/middleware.js';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.status(200).send({ status: 200, message: 'Server running...' });
})
app.get('/ping', (req, res) => {
    res.status(200).send({ status: 200, message: 'pong' });
})

app.use('/auth', authRouter);
app.use('/admin', middleware.AdminMiddleware, adminRouter);
app.use('/user', middleware.AuthMiddleware, userRouter);

app.use(middleware.ErrorHandler);


export default app;
