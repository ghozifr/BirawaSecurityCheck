import express from 'express'
import MitraController from '../controllers/MitraController'
import { validateMitraRequest } from '../middlewares/validation'

const router = express.Router()

router.post('/', validateMitraRequest, MitraController.createMitra)
router.get('/', MitraController.getMitra)
router.post('/users', MitraController.getMitraUsers)
router.post('/kontraks', MitraController.getMitraKontraks)
router.get('/all', MitraController.getMitras)
router.patch('/', MitraController.updateMitra)
router.delete('/', MitraController.deleteMitra)

export default router