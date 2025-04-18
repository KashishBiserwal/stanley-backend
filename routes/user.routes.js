import { Router } from 'express'
import userController from '../controller/user.controller.js'

const userRouter = Router()

userRouter.get('/', userController.getDetails)
userRouter.put('/type', userController.updateUserType)
userRouter.get('/otp', userController.sendOtp)
userRouter.post('/verify', userController.verifyOtp)
userRouter.post('/updatePassword', userController.updatePassword)

export default userRouter