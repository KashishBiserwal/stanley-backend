import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const AdminMiddleware = async (req, res, next) => {
    const token = req.headers?.authorization

    if (!token) {
        return res.status(200).send({
            status: 400,
            error: 'Authentication failed',
            error_description: 'token is required',
        })
    }

    const splittedToken = token.split(' ')
    if (splittedToken[0] !== 'Bearer') {
        return res.status(200).send({
            status: 400,
            error: 'Authentication failed',
            error_description: 'Invalid token type',
        })
    }

    let decryptedToken;
    try {
        decryptedToken = jwt.verify(splittedToken[1], process.env.JWT_SECRET)
    } catch (err) {
        return next(err)
    }

    const email = decryptedToken?.email
    const role = decryptedToken?.role
    if (!email) {
        const err = new Error("Error: token doens't contain email")
        return next(err)
    }
    if(!role){
        return res.status(200).send({ status: 400, error: 'Role not found.', error_description: 'Role does not exist' })
    }
    try {
        const user = await prisma.user.findFirst({where: {email, role: 'ADMIN' }})
        if (!user) {
            return res.status(200).send({ status: 400, error: 'User not found.', error_description: 'Admin does not exist' })
        }
        delete (user)?.password
        req.user = user
        next()
    } catch (err) {
        return res.status(200).send({ status: 400, error: 'user not found.', error_description: (err).message })
    }
}
const AuthMiddleware = async (req, res, next) => {
    const token = req.headers?.authorization

    if (!token) {
        return res.status(200).send({
            status: 400,
            error: 'Authentication failed',
            error_description: 'token is required',
        })
    }

    const splittedToken = token.split(' ')
    if (splittedToken[0] !== 'Bearer') {
        return res.status(200).send({
            status: 400,
            error: 'Authentication failed',
            error_description: 'Invalid token type',
        })
    }

    let decryptedToken
    try {
        decryptedToken = jwt.verify(splittedToken[1], process.env.JWT_SECRET)
    } catch (err) {
        return next(err)
    }

    const email = decryptedToken?.email
    if (!email) {
        const err = new Error("Error: token doens't contain email")
        return next(err)
    }
    try {
        const user = await prisma.user.findFirst({where: {email, role: 'USER' }})
        if (!user) {
            return res.status(200).send({ status: 400, error: 'user not found.', error_description: 'User does not exist' })
        }
        delete (user)?.password
        req.user = user
        next()
    } catch (err) {
        return res.status(200).send({ status: 400, error: 'user not found.', error_description: (err).message })
    }
}

const ErrorHandler = (err, req, res, _next) => {
    if (err instanceof Error) {
        if (err.name === 'PrismaClientKnownRequestError') {
            return res.status(200).send({
                status: 400,
                error: 'Invalid Payload',
                error_description: err.message,
            })
        }
        console.log(err);
        return res.status(200).send({
            status: 500,
            error: 'Internal Server Error',
            error_description: err.message,
        })
    }
}

const middleware = { ErrorHandler, AuthMiddleware, AdminMiddleware }

export default middleware
