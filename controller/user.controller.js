import { PrismaClient } from '@prisma/client'
import helper from '../utils/helpers.js'
const prisma = new PrismaClient()
const SALT_ROUND = process.env.SALT_ROUND
const ITERATION = 100
const KEYLENGTH = 10
const DIGEST_ALGO = 'sha512'
import crypto from 'crypto'
import Razorpay from 'razorpay'

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const getDetails = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(200).send({
            status: 400,
            error: 'User not found',
            error_description: 'User does not exist',
        })
    }
    delete user.password
    return res.status(200).send({ status: 200, message: 'User details', user: user })
}

const updateUserType = async (req, res, next) => {
    try {
        const user = req.user
        const { type } = req.body
        if (!user) {
            return res.status(200).send({
                status: 400,
                error: 'User not found',
                error_description: 'User does not exist',
            })
        }
        if (!type || type !== 'STUDENT' && type !== 'PROFESSIONAL') {
            return res.status(200).send({
                status: 400,
                error: 'Type not found',
                error_description: 'Type does not exist, it should be either STUDENT or PROFESSIONAL',
            })
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { type: type },
        })
        return res.status(200).send({ status: 200, message: 'User type updated' })
    } catch (err) {
        return next(err)
    }
}

const sendOtp = async (req, res, next) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(200).send({
                status: 400,
                error: 'User not found',
                error_description: 'User does not exist',
            })
        }
        const otp = helper.generateRandomOtp()
        await prisma.user.update({
            where: { id: user.id },
            data: { otp: otp },
        })
        const email = user.email
        helper.sendMail(email, 'Stanley', `Your OTP is ${otp}`)
        return res.status(200).send({ status: 200, message: 'OTP sent', otp: otp })
    } catch (err) {
        return next(err)
    }
}

const verifyOtp = async (req, res, next) => {
    try {
        const user = req.user
        const { otp } = req.body
        if (!user) {
            return res.status(200).send({
                status: 400,
                error: 'User not found',
                error_description: 'User does not exist',
            })
        }
        if (!otp) {
            return res.status(200).send({
                status: 400,
                error: 'OTP not found',
                error_description: 'OTP does not exist',
            })
        }
        if (typeof otp !== 'number' || otp.toString().length !== 6) {
            return res.status(200).send({
                status: 400,
                error: 'Invalid OTP',
                error_description: 'OTP format invalid',
            })
        }
        if (user.otp !== otp) {
            return res.status(200).send({
                status: 400,
                error: 'Invalid OTP',
                error_description: 'OTP is invalid',
            })
        }
        await prisma.user.update({
            where: { id: user.id },
            data: { otp: null },
        })
        return res.status(200).send({ status: 200, verified: true, message: 'OTP verified' })
    } catch (err) {
        return next(err)
    }
}

const updatePassword = async (req, res, next) => {
    try {
        const user = req.user
        const { password } = req.body
        if (!user) {
            return res.status(200).send({
                status: 400,
                error: 'User not found',
                error_description: 'User does not exist',
            })
        }
        if (!password) {
            return res.status(200).send({
                status: 400,
                error: 'Password not found',
            })
        }

        const isOtpVerified = user.otp === null

        if (!isOtpVerified) {
            return res.status(200).send({
                status: 400,
                error: 'OTP not verified',
                error_description: 'Please verify your OTP first',
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
        return res.status(200).send({ status: 200, message: 'Password updated' })
    } catch (err) {
        return next(err)
    }
}

const updateUserProfile = async (req, res, next) => {
    try {
        const user = req.user
        const { name, phone, image } = req.body
        if (!user) {
            return res.status(200).send({
                status: 400,
                error: 'User not found',
                error_description: 'User does not exist',
            })
        }
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

const deleteAccount = async (req, res, next) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(200).send({
                status: 400,
                error: 'User not found',
                error_description: 'User does not exist',
            })
        }
        await prisma.user.delete({
            where: { id: user.id },
        })
        return res.status(200).send({ status: 200, message: 'Account deleted' })
    } catch (err) {
        return next(err)
    }
}

const getFaqs = async (req, res, next) => {
    try {
        const faqs = await prisma.faq.findMany({ orderBy: { createdAt: 'desc' } })
        return res.status(200).send({ status: 200, message: 'FAQs', faqs: faqs })
    } catch (err) {
        return next(err)
    }
}

const getAudioBooks = async (req, res, next) => {
    try {
        const audioBooks = await prisma.audioBook.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return res.status(200).send({ status: 200, message: 'Audio Books', audioBooks: audioBooks })
    } catch (err) {
        return next(err)
    }
}

const getAudioBookById = async (req, res, next) => {
    try {
        const { id } = req.params
        const audioBook = await prisma.audioBook.findUnique({
            where: { id: parseInt(id) },
        })
        if (!audioBook) {
            return res.status(200).send({ status: 400, error: 'Audio Book not found' })
        }
        return res.status(200).send({ status: 200, message: 'Audio Book', audioBook: audioBook })
    } catch (err) {
        return next(err)
    }
}

const getVideos = async (req, res, next) => {
    try {
        const videos = await prisma.video.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return res.status(200).send({ status: 200, message: 'Videos', videos: videos })
    } catch (err) {
        return next(err)
    }
}

const getVideoById = async (req, res, next) => {
    try {
        const { id } = req.params
        const video = await prisma.video.findUnique({
            where: { id: parseInt(id) },
        })
        if (!video) {
            return res.status(200).send({ status: 400, error: 'Video not found' })
        }
        return res.status(200).send({ status: 200, message: 'Video', video: video })
    } catch (err) {
        return next(err)
    }
}

const purchaseAudiobook = async (req, res, next) => {
    try {
        const user = req.user;
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const { amount } = req.body;
        const userId = user.id;

        const order = await razorpayInstance.orders.create({
            amount: amount * 100, // amount in paise
            currency: 'INR',
        })

        const createdOrder = await prisma.order.create({
            data: {
                orderId: order.id,
                status: 'PENDING',
                userId: userId
            }
        });
        return res.status(200).send({ message: 'Order created!', order: createdOrder, key_id: rzp.key_id });
    }
    catch (error) {
        console.log(error);
        res.status(403).json({ message: 'Something went wrong', error });
    }
}

const updateTransactionStatus = async (req, res, next) => {
    try {
        const { payment_id, order_id } = req.body;
        const order = await prisma.order.findUnique({ where: { orderId: order_id } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found!' })
        }
        const razorpay_signature = req.headers['x-razorpay-signature']
        if (!razorpay_signature) return res.status(200).send({ status: 400, message: 'x-razorpay-signature' })
        let sha256 = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        sha256.update(order_id + '|' + payment_id)

        const generated_signature = sha256.digest('hex')

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed.' })
        }
        const payment = await razorpayInstance.payments.fetch(payment_id)

        if (payment.status === 'captured') {
            const updatedOrder = await prisma.order.update({
                where: { orderId: order_id },
                data: { paymentId: payment_id, status: 'SUCCESS' }
            })
            return res.status(200).send({ message: 'Status updated', order: updatedOrder });
        }else {
            const updatedOrder = await prisma.order.update({
                where: { orderId: order_id },
                data: { paymentId: payment_id, status: 'FAILED' }
            })
            return res.status(200).send({ message: 'Payment not captured', order: updatedOrder });
        }
    }
    catch (error) {
        console.log('Error in updateTransactionStatus:', error);
        res.status(500).json({ message: 'Transaction update failed', error });
    }
}

const userController = {
    getDetails,
    updateUserType,
    sendOtp,
    verifyOtp,
    updatePassword,
    updateUserProfile,
    deleteAccount,
    getFaqs,
    getAudioBooks,
    getAudioBookById,
    getVideos,
    getVideoById,
    purchaseAudiobook,
    updateTransactionStatus
}

export default userController