import express from 'express'
import { update, instructorUpdated, getUserInfo } from '../controllers/user'
import { requireSignin } from '../middlewares/index'

const router = express.Router()

router.post('/user/updateInfo', requireSignin, update)
router.post('/user/updateInstructorInfo', requireSignin, instructorUpdated)
router.get('/user/:userId', getUserInfo)

module.exports = router
