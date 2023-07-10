import express from 'express'
import formidable from 'express-formidable'

import { requireSignin, isInstructor, isEnrolled } from '../middlewares/index'
import {
  getQuestion,
  askQuestion,
  answerQuestion,
  deleteQuestion,
  deleteAnswer,
} from '../controllers/question'

const router = express.Router()

router.get('/question', requireSignin, getQuestion)
router.post('/question/:courseId/:lessonIndex', requireSignin, askQuestion)
router.post('/question/:questionId', requireSignin, answerQuestion)
router.delete('/question/:questionId', requireSignin, deleteQuestion)
router.delete(
  '/question/:questionId/answers/:answerId',
  requireSignin,
  deleteAnswer
)

module.exports = router
