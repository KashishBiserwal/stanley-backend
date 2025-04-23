import { Router } from 'express'
import userController from '../controller/user.controller.js'

const userRouter = Router()

userRouter.get('/', userController.getDetails)
userRouter.put('/type', userController.updateUserType)
userRouter.get('/otp', userController.sendOtp)
userRouter.post('/verify', userController.verifyOtp)
userRouter.post('/updatePassword', userController.updatePassword)
userRouter.post('/updateProfile', userController.updateUserProfile)
userRouter.delete('/deleteAccount', userController.deleteAccount)
userRouter.get('/faqs', userController.getFaqs)
userRouter.get('/audiobooks', userController.getAudioBooks)
userRouter.get('/audiobooks/:id', userController.getAudioBookById)
userRouter.get('/videos', userController.getVideos)
userRouter.get('/videos/:id', userController.getVideoById)
userRouter.post('/createOrder', userController.purchaseAudiobook)
userRouter.post('/updateOrder', userController.updateTransactionStatus);


export default userRouter