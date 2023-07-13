import express from "express"

import { requireSignin } from "../middlewares/index"
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
} from "../controllers/instructor"

const router = express.Router()

router.post("/make-instructor", requireSignin, makeInstructor)
router.post("/get-account-status", requireSignin, getAccountStatus)
router.get("/current-instructor", requireSignin, currentInstructor)
router.get("/instructor-courses", requireSignin, instructorCourses)
router.get("/instructor/balance", requireSignin, instructorBalance)
router.get(
  "/instructor/payout-settings",
  requireSignin,
  instructorPayoutSettings
)
router.get("/instructor/students", requireSignin, studentCount)
router.get("/current-pending", requireSignin, currentPending)
router.get(
  "/current-instructorOrPending",
  requireSignin,
  currentInstructorOrPending
)

module.exports = router
