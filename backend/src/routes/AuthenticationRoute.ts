import express from 'express'
import AuthenticationController from '../controllers/AuthenticationController'
import { csrfToken } from '../middlewares/csurf'
import { clientType } from '../middlewares/auth'

const router = express.Router()

router.post('/', clientType, AuthenticationController.authenticateUser)
router.post('/signin', AuthenticationController.loginUser)
router.post('/logout', clientType, AuthenticationController.logoutUser)
router.get('/verify-email', AuthenticationController.verifyEmail)
router.get('/csrf-token', csrfToken)

export default router