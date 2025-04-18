import { PrismaClient } from '@prisma/client'
import helper from '../utils/helpers.js'
import crypto from 'crypto'
const prisma = new PrismaClient()
const SALT_ROUND = process.env.SALT_ROUND
const ITERATION = 100
const KEYLENGTH = 10
const DIGEST_ALGO = 'sha512'
import jwt from 'jsonwebtoken'

const signup = async (req, res, next) => {
    try {
        const body = req.body;

        if (!helper.isValidatePaylod(body, ['name', 'password', 'email'])) {
            return res.status(200).send({
                status: 400,
                error: 'Invalid Payload',
                error_description: 'name, password, email are required.',
            });
        }

        const { password, name, phone, referralCode } = req.body;
        const email = String(req.body.email).trim();

        if (name.length > 25) {
            return res.status(400).send({ status: 400, error: 'Name too long' });
        }

        const escapePattern = /^[\S]*$/;
        if (!escapePattern.test(name)) {
            return res.status(400).send({ status: 400, error: 'Name contains invalid characters' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: 400, error: 'Invalid Email address' });
        }

        if (typeof password !== 'string') return res.status(400).send({ error: 'password should be a string' });
        if (password.includes(' ') || password.length < 5) {
            return res
                .status(400)
                .send({ status: 400, error: 'Password should not contain any spaces, minimum length 5 required' });
        }

        if (!escapePattern.test(password)) {
            return res.status(400).send({ status: 400, error: 'Password cannot contain invalid characters' });
        }

        try {
            const isEmailExists = await prisma.user.findFirst({ where: { email } });
            if (isEmailExists) {
                return res
                    .status(200)
                    .send({ status: 400, error: 'BAD REQUEST', error_description: 'email already exists.' });
            }
            if (phone) {
                const isPhoneExists = await prisma.user.findFirst({ where: { phone } });
                if (isPhoneExists) {
                    return res
                        .status(200)
                        .send({ status: 400, error: 'BAD REQUEST', error_description: 'phone number already exists.' });
                }
            }
        } catch (err) {
            return next(err);
        }

        crypto.pbkdf2(password, SALT_ROUND, ITERATION, KEYLENGTH, DIGEST_ALGO, async (err, hash_password) => {
            if (err) return next(err);

            try {
                const hash_password_hex = hash_password.toString('hex');
                const user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hash_password_hex,
                        phone,
                        referralCode
                    },
                });

                delete user.password

                return res.status(200).json({ status: 'success', message: 'User created successfully', user: user });
            } catch (err) {
                return next(err);
            }
        });
    } catch (err) {
        return next(err);
    }
};


const login = async (req, res, next) => {
    try {
        const body = req.body
        const isValidPayload = helper.isValidatePaylod(body, ['email', 'password'])
        if (!isValidPayload) {
            return res
                .status(200)
                .send({ status: 400, error: 'Invalid payload', error_description: 'email and password are requried.' })
        }
        const { password } = req.body
        if (typeof password !== 'string') return res.status(400).send({ error: 'password must be a string' })
        let hash_password = crypto.pbkdf2Sync(password, SALT_ROUND, ITERATION, KEYLENGTH, DIGEST_ALGO)
        hash_password = hash_password.toString('hex')
        try {
            const userDetails = await prisma.user.findUnique({
                where: { email: String(body.email), password: hash_password, role: 'USER' },
            })
            if (!userDetails) {
                return res.status(200).send({
                    status: 200,
                    error: 'Invalid credentials.',
                    error_description: 'email or password is not valid',
                })
            }

            delete (userDetails).password

            const token = jwt.sign({ email: userDetails.email, role: userDetails.role }, process.env.JWT_SECRET, {
                expiresIn: '7d',
            })

            return res.status(200).send({
                status: 200,
                message: 'Login successful',
                data: {
                    user: userDetails,
                    token,
                },
            })

        } catch (err) {
            return res.status(200).send({
                status: 200,
                error: 'Invalid credentials.',
                error_description: (err).message,
            })
        }
    } catch (err) {
        return next(err)
    }
}

const adminSignup = async (req, res, next) => {
    try {
        const body = req.body;

        if (!helper.isValidatePaylod(body, ['name', 'password', 'email'])) {
            return res.status(200).send({
                status: 400,
                error: 'Invalid Payload',
                error_description: 'name, password, email are required.',
            });
        }

        const { password, name, phone, referralCode } = req.body;
        const email = String(req.body.email).trim();

        if (name.length > 25) {
            return res.status(400).send({ status: 400, error: 'Name too long' });
        }

        const escapePattern = /^[\S]*$/;
        if (!escapePattern.test(name)) {
            return res.status(400).send({ status: 400, error: 'Name contains invalid characters' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: 400, error: 'Invalid Email address' });
        }

        if (typeof password !== 'string') return res.status(400).send({ error: 'password should be a string' });
        if (password.includes(' ') || password.length < 5) {
            return res
                .status(400)
                .send({ status: 400, error: 'Password should not contain any spaces, minimum length 5 required' });
        }

        if (!escapePattern.test(password)) {
            return res.status(400).send({ status: 400, error: 'Password cannot contain invalid characters' });
        }

        try {
            const isEmailExists = await prisma.user.findFirst({ where: { email } });
            if (isEmailExists) {
                return res
                    .status(200)
                    .send({ status: 400, error: 'BAD REQUEST', error_description: 'email already exists.' });
            }
            if (phone) {
                const isPhoneExists = await prisma.user.findFirst({ where: { phone } });
                if (isPhoneExists) {
                    return res
                        .status(200)
                        .send({ status: 400, error: 'BAD REQUEST', error_description: 'phone number already exists.' });
                }
            }
        } catch (err) {
            return next(err);
        }

        crypto.pbkdf2(password, SALT_ROUND, ITERATION, KEYLENGTH, DIGEST_ALGO, async (err, hash_password) => {
            if (err) return next(err);

            try {
                const hash_password_hex = hash_password.toString('hex');
                const user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hash_password_hex,
                        phone,
                        referralCode,
                        role: 'ADMIN'
                    },
                });

                delete user.password

                return res.status(200).json({ status: 'success', message: 'Admin created successfully', user: user });
            } catch (err) {
                return next(err);
            }
        });
    } catch (err) {
        return next(err);
    }
};

const adminLogin = async (req, res, next) => {
    try {
        const body = req.body
        const isValidPayload = helper.isValidatePaylod(body, ['email', 'password'])
        if (!isValidPayload) {
            return res
                .status(200)
                .send({ status: 400, error: 'Invalid payload', error_description: 'email and password are requried.' })
        }
        const { password } = req.body
        if (typeof password !== 'string') return res.status(400).send({ error: 'password must be a string' })
        let hash_password = crypto.pbkdf2Sync(password, SALT_ROUND, ITERATION, KEYLENGTH, DIGEST_ALGO)
        hash_password = hash_password.toString('hex')
        try {
            const userDetails = await prisma.user.findUnique({
                where: { email: String(body.email), password: hash_password, role: 'ADMIN' },
            })
            if (!userDetails) {
                return res.status(200).send({
                    status: 200,
                    error: 'Invalid credentials.',
                    error_description: 'email or password is not valid',
                })
            }

            delete (userDetails).password

            const token = jwt.sign({ email: userDetails.email, role: userDetails.role }, process.env.JWT_SECRET, {
                expiresIn: '7d',
            })

            return res.status(200).send({
                status: 200,
                message: 'Login successful',
                data: {
                    user: userDetails,
                    token,
                },
            })

        } catch (err) {
            return res.status(200).send({
                status: 200,
                error: 'Invalid credentials.',
                error_description: (err).message,
            })
        }
    } catch (err) {
        return next(err)
    }
}



const authController = {
    signup,
    login,
    adminSignup,
    adminLogin
}

export default authController