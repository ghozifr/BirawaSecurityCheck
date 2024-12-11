import express from 'express'
import KontrakController from '../controllers/KontrakController'
import { validateKontrakRequest } from '../middlewares/validation'

const router = express.Router()

router.post('/', validateKontrakRequest, KontrakController.createKontrak)
router.get('/', KontrakController.getKontrak)
router.post('/pekerjaans', KontrakController.getKontrakPekerjaans)
router.get('/all', KontrakController.getKontraks)
router.patch('/', KontrakController.updateKontrak)
router.delete('/', KontrakController.deleteKontrak)

export default router