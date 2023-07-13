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
  updateQuestion,
  generateRandomQuiz,
  addReservedQuestion,
} from '../controllers/quiz'

const router = express.Router()

module.exports = router
