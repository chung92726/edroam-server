import express from 'express'
import formidable from 'express-formidable'
import {
  requireSignin,
  isInstructor,
  isEnrolled,
  isVerifiedInstructor,
} from '../middlewares/index'
import { saveProgress, getProgress } from '../controllers/lessonHistory'

const router = express.Router()

router.post('/lesson-history/save-progess', requireSignin, saveProgress)
router.get('/lesson-history/get-progress/:courseId', requireSignin, getProgress)

module.exports = router
