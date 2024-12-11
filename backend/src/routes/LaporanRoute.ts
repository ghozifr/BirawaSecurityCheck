import express from 'express'
import multer from 'multer'
import LaporanController from '../controllers/LaporanController'
import { validateLaporanRequest, validateNumberOfFiles } from '../middlewares/validation'

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
})

router.post('/', upload.array('files'), validateLaporanRequest, validateNumberOfFiles, LaporanController.createLaporan)
router.get('/all', LaporanController.getLaporans)
router.post('/laporan-pekerjaan', LaporanController.getPekerjaanLaporans)
router.get('/:laporanId', LaporanController.getLaporan)
router.patch('/', LaporanController.updateLaporan)
router.delete('/', LaporanController.deleteLaporan)

export default router