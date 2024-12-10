import express from 'express'
import UserController from '../controllers/UserController'
import { clientType, jwtCheck } from '../middlewares/auth'
import { validateUserRequest } from '../middlewares/validation'

const router = express.Router()

router.post('/', validateUserRequest, UserController.createUser)
router.get('/', UserController.getUser)
router.get('/all', UserController.getUsers)
router.patch('/', UserController.updateUser)
router.post('/soft-delete', UserController.deleteUser)

export default router