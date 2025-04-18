import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


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

const adminController = {
    getAllUsers,
    getUserById,
    deleteUser
}

export default adminController