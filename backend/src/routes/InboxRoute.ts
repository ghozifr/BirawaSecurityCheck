import express from 'express'
import InboxController from '../controllers/InboxController'

const router = express.Router()

router.post('/', InboxController.createInbox)
router.post('/e', InboxController.getInbox)
router.post('/es', InboxController.getInboxes)

export default router