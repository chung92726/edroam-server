import express from 'express'

import { requireSignin } from '../middlewares/index'
import {
  createCourseReview,
  getCourseReviews,
  getCourseReviewStats,
} from '../controllers/courseReview'
const router = express.Router()

router.post('/course-review/:courseId', requireSignin, createCourseReview)
router.get('/course-review/:courseId', getCourseReviews)
router.get('/course-review-stats/:courseId', getCourseReviewStats)

module.exports = router
