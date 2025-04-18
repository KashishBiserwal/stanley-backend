import { PrismaClient } from '@prisma/client'
import helper from '../utils/helpers.js'
const prisma = new PrismaClient()
const SALT_ROUND = process.env.SALT_ROUND
const ITERATION = 100
const KEYLENGTH = 10
const DIGEST_ALGO = 'sha512'
import crypto from 'crypto'


const getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: 'USER'
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                type: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if (!users) {
            return res.status(200).send({
                status: 400,
                error: 'Users not found',
                error_description: 'Users do not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'User details', users: users })
    } catch (err) {
        return next(err)
    }
}

const getUserById = async (req, res, next) => {
    try {
        const ID = req.params.id
        if(isNaN(Number(ID))) {
            return res.status(200).send({
                status: 400,
                error: 'User id not found',
                error_description: 'User id does not exist',
            })
        }
        const userId = Number(ID)
        if (!userId) {
            return res.status(200).send({
                status: 400,
                error: 'User id not found',
                error_description: 'User id does not exist',
            })
        }
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(200).send({
                status: 400,
                error: 'User not found',
                error_description: 'User does not exist',
            })
        }
        delete user.password
        return res.status(200).send({ status: 200, message: 'User details', user: user })
    } catch (err) {
        return next(err)
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const ID = req.params.id
        if(isNaN(Number(ID))) {
            return res.status(200).send({
                status: 400,
                error: 'User id not found',
                error_description: 'User id does not exist',
            })
        }
        const userId = Number(ID)
        if (!userId) {
            return res.status(200).send({
                status: 400,
                error: 'User id not found',
                error_description: 'User id does not exist',
            })
        }
        const user = await prisma.user.delete({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(200).send({
                status: 400,
                error: 'User not found',
                error_description: 'User does not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'User deleted successfully' })
    } catch (err) {
        return next(err)
    }
}

const createFaq = async (req, res, next) => {
    try {
        const { question, answer } = req.body
        if (!question || !answer) {
            return res.status(200).send({
                status: 400,
                error: 'Question or answer not found',
                error_description: 'Question or answer does not exist',
            })
        }
        const faq = await prisma.faq.create({
            data: {
                question: question,
                answer: answer
            }
        })
        if (!faq) {
            return res.status(200).send({
                status: 400,
                error: 'Faq not created',
                error_description: 'Faq does not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Faq created successfully', faq: faq })
    } catch (err) {
        return next(err)
    }
}

const getAllFaqs = async (req, res, next) => {
    try {
        const faqs = await prisma.faq.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                question: true,
                answer: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if (!faqs) {
            return res.status(200).send({
                status: 400,
                error: 'Faqs not found',
                error_description: 'Faqs do not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Faqs details', faqs: faqs })
    } catch (err) {
        return next(err)
    }
}

const deleteFaq = async (req, res, next) => {
    try {
        const ID = req.params.id
        if(isNaN(Number(ID))) {
            return res.status(200).send({
                status: 400,
                error: 'Faq id not found',
                error_description: 'Faq id does not exist',
            })
        }
        const faqId = Number(ID)
        if (!faqId) {
            return res.status(200).send({
                status: 400,
                error: 'Faq id not found',
                error_description: 'Faq id does not exist',
            })
        }
        const faq = await prisma.faq.delete({
            where: {
                id: faqId
            }
        })
        if (!faq) {
            return res.status(200).send({
                status: 400,
                error: 'Faq not found',
                error_description: 'Faq does not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Faq deleted successfully' })
    } catch (err) {
        return res.status(200).send({
            status: 400,
            error: 'Faq not found',
            error_description: 'Faq does not exist',
        })
    }
}

const updateUserProfile = async (req, res, next) => {
    try {
        const ID = req.params.id
        if(isNaN(Number(ID))) {
            return res.status(200).send({
                status: 400,
                error: 'User id not found',
                error_description: 'User id does not exist',
            })
        }
        const userId = Number(ID)
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(200).send({
                status: 400,
                error: 'User not found',
                error_description: 'User does not exist',
            })
        }
        const { name, phone, image } = req.body
        if (!name && !phone && !image) {
            return res.status(200).send({
                status: 400,
                error: 'Invalid request',
                error_description: 'Name, image or phone are required',
            })
        }
        await prisma.user.update({
            where: { id: user.id },
            data: { name: name, phone: phone, profilePic: image },
        })
        return res.status(200).send({ status: 200, message: 'User profile updated' })
    } catch (err) {
        return next(err)
    }
}

const updateUserPassword = async (req, res, next) => {
    try {
        const ID = req.params.id
        if(isNaN(Number(ID))) {
            return res.status(200).send({
                status: 400,
                error: 'User id not found',
                error_description: 'User id does not exist',
            })
        }
        const userId = Number(ID)
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(200).send({
                status: 400,
                error: 'User not found',
                error_description: 'User does not exist',
            })
        }
        const { password } = req.body
        if (!password) {
            return res.status(200).send({
                status: 400,
                error: 'Invalid request',
                error_description: 'Password is required',
            })
        }
        if (typeof password !== 'string') return res.status(400).send({ error: 'password should be a string' });
        if (password.includes(' ') || password.length < 5) {
            return res
                .status(400)
                .send({ status: 400, error: 'Password should not contain any spaces, minimum length 5 required' });
        }
        const escapePattern = /^[\S]*$/;

        if (!escapePattern.test(password)) {
            return res.status(400).send({ status: 400, error: 'Password cannot contain invalid characters' });
        }

        crypto.pbkdf2(password, SALT_ROUND, ITERATION, KEYLENGTH, DIGEST_ALGO, async (err, hash_password) => {
            if (err) return next(err);
            const hash_password_hex = hash_password.toString('hex');
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hash_password_hex },
            })
        }
        )
        return res.status(200).send({ status: 200, message: 'User password updated' })
    } catch (err) {
        return next(err)
    }
}

const createAudioBook = async (req, res, next) => {
    try {
        const { title, description, image, audio, price } = req.body
        if (!title || !description || !image || !audio || !price) {
            return res.status(200).send({
                status: 400,
                error: 'Title, description, image, price or audio not found',
                error_description: 'Title, description, image, price or audio does not exist',
            })
        }
        const audiobook = await prisma.audioBook.create({
            data: {
                title: title,
                description: description,
                image: image,
                audio: audio,
                price: price
            }
        })
        if (!audiobook) {
            return res.status(200).send({
                status: 400,
                error: 'Audio book not created',
                error_description: 'Audio book does not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Audio book created successfully', audiobook: audiobook })
    } catch (err) {
        return next(err)
    }
}

const getAllAudioBooks = async (req, res, next) => {
    try {
        const audiobooks = await prisma.audioBook.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                title: true,
                description: true,
                image: true,
                audio: true,
                price: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if (!audiobooks) {
            return res.status(200).send({
                status: 400,
                error: 'Audio books not found',
                error_description: 'Audio books do not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Audio books details', audiobooks: audiobooks })
    } catch (err) {
        return next(err)
    }
}

const deleteAudioBook = async (req, res, next) => {
    try {
        const ID = req.params.id
        if(isNaN(Number(ID))) {
            return res.status(200).send({
                status: 400,
                error: 'Audio book id not found',
                error_description: 'Audio book id does not exist',
            })
        }
        const audiobookId = Number(ID)
        if (!audiobookId) {
            return res.status(200).send({
                status: 400,
                error: 'Audio book id not found',
                error_description: 'Audio book id does not exist',
            })
        }
        const audiobook = await prisma.audioBook.delete({
            where: {
                id: audiobookId
            }
        })
        if (!audiobook) {
            return res.status(200).send({
                status: 400,
                error: 'Audio book not found',
                error_description: 'Audio book does not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Audio book deleted successfully' })
    } catch (err) {
        return res.status(200).send({
            status: 400,
            error: 'Audio book not found',
            error_description: 'Audio book does not exist',
        })
    }
}

const getAudioBookById = async (req, res, next) => {
    try {
        const ID = req.params.id
        if(isNaN(Number(ID))) {
            return res.status(200).send({
                status: 400,
                error: 'Audio book id not found',
                error_description: 'Audio book id does not exist',
            })
        }
        const audiobookId = Number(ID)
        if (!audiobookId) {
            return res.status(200).send({
                status: 400,
                error: 'Audio book id not found',
                error_description: 'Audio book id does not exist',
            })
        }
        const audiobook = await prisma.audioBook.findFirst({
            where: {
                id: audiobookId
            }
        })
        if (!audiobook) {
            return res.status(200).send({
                status: 400,
                error: 'Audio book not found',
                error_description: 'Audio book does not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Audio book details', audiobook: audiobook })
    } catch (err) {
        return next(err)
    }
}

const createVideo = async (req, res, next) => {
    try {
        const { title, description, image, video } = req.body
        if (!title || !description || !video) {
            return res.status(200).send({
                status: 400,
                error: 'Title, description or video not found',
                error_description: 'Title, description or video does not exist',
            })
        }
        const createdVideo = await prisma.video.create({
            data: {
                title: title,
                description: description,
                image: image,
                video: video
            }
        })
        if (!createdVideo) {
            return res.status(200).send({
                status: 400,
                error: 'Video not created',
                error_description: 'Video does not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Video created successfully', video: createdVideo })
    } catch (err) {
        return next(err)
    }
}

const getAllVideos = async (req, res, next) => {
    try {
        const videos = await prisma.video.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                title: true,
                description: true,
                image: true,
                video: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if (!videos) {
            return res.status(200).send({
                status: 400,
                error: 'Videos not found',
                error_description: 'Videos do not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Videos details', videos: videos })
    } catch (err) {
        return next(err)
    }
}

const deleteVideo = async (req, res, next) => {
    try {
        const ID = req.params.id
        if(isNaN(Number(ID))) {
            return res.status(200).send({
                status: 400,
                error: 'Video id not found',
                error_description: 'Video id does not exist',
            })
        }
        const videoId = Number(ID)
        if (!videoId) {
            return res.status(200).send({
                status: 400,
                error: 'Video id not found',
                error_description: 'Video id does not exist',
            })
        }
        const video = await prisma.video.delete({
            where: {
                id: videoId
            }
        })
        if (!video) {
            return res.status(200).send({
                status: 400,
                error: 'Video not found',
                error_description: 'Video does not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Video deleted successfully' })
    } catch (err) {
        return res.status(200).send({
            status: 400,
            error: 'Video not found',
            error_description: 'Video does not exist',
        })
    }
}

const getVideoById = async (req, res, next) => {
    try {
        const ID = req.params.id
        if(isNaN(Number(ID))) {
            return res.status(200).send({
                status: 400,
                error: 'Video id not found',
                error_description: 'Video id does not exist',
            })
        }
        const videoId = Number(ID)
        if (!videoId) {
            return res.status(200).send({
                status: 400,
                error: 'Video id not found',
                error_description: 'Video id does not exist',
            })
        }
        const video = await prisma.video.findFirst({
            where: {
                id: videoId
            }
        })
        if (!video) {
            return res.status(200).send({
                status: 400,
                error: 'Video not found',
                error_description: 'Video does not exist',
            })
        }
        return res.status(200).send({ status: 200, message: 'Video details', video: video })
    } catch (err) {
        return next(err)
    }
}

const adminController = {
    getAllUsers,
    getUserById,
    deleteUser,
    createFaq,
    getAllFaqs,
    deleteFaq,
    updateUserProfile,
    updateUserPassword,
    createAudioBook,
    getAllAudioBooks,
    deleteAudioBook,
    getAudioBookById,
    createVideo,
    getAllVideos,
    deleteVideo,
    getVideoById,
}

export default adminController