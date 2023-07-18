import express from 'express'
import formidable from 'express-formidable'

import { requireSignin, isInstructor, isEnrolled } from '../middlewares/index'
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  deleteQuestion,
  updateQuestions,
  generateRandomQuiz,
  addReservedQuestion,
  publishQuiz,
  unpublishQuiz,
} from '../controllers/quiz'

const router = express.Router()

router.post('/quiz/create-quiz', requireSignin, isInstructor, createQuiz)
router.get('/quiz/get-quizzes', requireSignin, isInstructor, getQuizzes)
router.delete(
  '/quiz/delete-quiz/:quizId',
  requireSignin,
  isInstructor,
  deleteQuiz
)
router.put(
  '/quiz/publish-quiz/:quizId',
  requireSignin,
  isInstructor,
  publishQuiz
)
router.put(
  '/quiz/unpublish-quiz/:quizId',
  requireSignin,
  isInstructor,
  unpublishQuiz
)
router.get('/quiz/get-quiz/:quizId', requireSignin, getQuizById)
router.put('/quiz/update-quiz/:quizId', requireSignin, isInstructor, updateQuiz)
router.put(
  '/quiz/update-question/:quizId',
  requireSignin,
  isInstructor,
  updateQuestions
)

module.exports = router
