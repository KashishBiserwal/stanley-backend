import { Router } from 'express'
import adminController from '../controller/admin.controller.js'

const adminRouter = Router()

adminRouter.get('/users', adminController.getAllUsers)
adminRouter.get('/users/:id', adminController.getUserById)
adminRouter.delete('/users/delete/:id', adminController.deleteUser)

export default adminRouter