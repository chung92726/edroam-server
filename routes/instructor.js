import express from 'express'

import { isInstructor, requireSignin } from '../middlewares/index'
import {
  makeInstructor,
  getAccountStatus,
  currentInstructor,
  instructorCourses,
  instructorBalance,
  instructorPayoutSettings,
  studentCount,
  currentPending,
  currentInstructorOrPending,
  getAllEnrolled,
  getRevenue,
} from '../controllers/instructor'

const router = express.Router()

router.post('/make-instructor', requireSignin, makeInstructor)
router.post('/get-account-status', requireSignin, getAccountStatus)
router.get('/current-instructor', requireSignin, currentInstructor)
router.get('/instructor-courses', requireSignin, instructorCourses)
router.get('/instructor/balance', requireSignin, instructorBalance)
router.get(
  '/instructor/payout-settings',
  requireSignin,
  instructorPayoutSettings
)
router.get('/instructor/students', requireSignin, studentCount)
router.get('/current-pending', requireSignin, currentPending)
router.get(
  '/current-instructorOrPending',
  requireSignin,
  currentInstructorOrPending
)
router.get(
  '/instructor/get-all-enrolled',
  requireSignin,
  isInstructor,
  getAllEnrolled
)
router.get(
  '/instructor/revenue/:courseId',
  requireSignin,
  isInstructor,
  getRevenue
)

module.exports = router
