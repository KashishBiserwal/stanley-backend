import { Router } from 'express'
import authController from '../controller/authController.js'

const authRouter = Router()

authRouter.post('/signup', authController.signup)
authRouter.post('/login', authController.login)
authRouter.post('/admin/login', authController.adminLogin)
authRouter.post('/admin/signup', authController.adminSignup)

export default authRouter