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
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); 
        const fileName = randomImageName() + ext;
        const fullPath = path.join(uploadDir, fileName);
        cb(null, fileName);
        },
        limits: {
        fileSize: 1024 * 1024 * 20, // 20 MB
    },
});

const upload = multer({ storage });


app.get('/', (req, res) => {
    res.status(200).send({ status: 200, message: 'Server running...' });
})
app.get('/ping', (req, res) => {
    res.status(200).send({ status: 200, message: 'pong' });
})

app.use('/auth', authRouter);
app.use('/admin', middleware.AdminMiddleware, adminRouter);
app.use('/user', middleware.AuthMiddleware, userRouter);

app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ status: 400, message: 'No file uploaded' });
    }

    const fileName = req.file.filename;
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;
    const fileExtension = path.extname(req.file.originalname).substring(1);
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

    res.status(200).send({
        status: 200,
        message: 'File uploaded successfully',
        url: fileUrl,
        data: {
            name: fileName,
            size: fileSize,
            type: fileType,
            extension: fileExtension,
        }
    });
});

app.use(middleware.ErrorHandler);


export default app;
