import { Router } from 'express'
import adminController from '../controller/admin.controller.js'

const adminRouter = Router()

adminRouter.get('/users', adminController.getAllUsers)
adminRouter.get('/users/:id', adminController.getUserById)
adminRouter.delete('/users/delete/:id', adminController.deleteUser)
adminRouter.post('/faqs/create', adminController.createFaq)
adminRouter.get('/faqs', adminController.getAllFaqs)
adminRouter.delete('/faqs/delete/:id', adminController.deleteFaq)
adminRouter.post('/user/profile/:id', adminController.updateUserProfile)
adminRouter.post('/user/password/:id', adminController.updateUserPassword)
adminRouter.post('/audiobook/create', adminController.createAudioBook)
adminRouter.get('/audiobook', adminController.getAllAudioBooks)
adminRouter.get('/audiobook/details/:id', adminController.getAudioBookById)
adminRouter.delete('/audiobook/delete/:id', adminController.deleteAudioBook)

export default adminRouter