import express from 'express'
import formidable from 'express-formidable'

import { requireSignin, isInstructor, isEnrolled } from '../middlewares/index'
import {
  uploadImage,
  removeImage,
  create,
  read,
  uploadVideo,
  removeVideo,
  addLesson,
  update,
  removeLesson,
  updateLesson,
  publishCourse,
  unpublishCourse,
  courses,
  checkEnrollment,
  freeEnrollment,
  paidEnrollment,
  stripeSuccess,
  userCourses,
  markCompleted,
  listCompleted,
  markInCompleted,
  studentCount,
  getHistory,
  getSignedUrl,
} from '../controllers/course'

const router = express.Router()

router.get('/courses', courses)

router.post('/course/upload-image', requireSignin, isInstructor, uploadImage)
router.post('/course/remove-image', requireSignin, isInstructor, removeImage)

router.get('/check-enrollment/:courseId', requireSignin, checkEnrollment)

//course
router.post('/course', requireSignin, isInstructor, create)
router.get('/course/:slug', read)
router.post(
  '/course/video-upload/:instructorId',
  requireSignin,
  isInstructor,
  formidable(),
  uploadVideo
)
router.post(
  '/course/video-remove/:instructorId',
  requireSignin,
  isInstructor,

  removeVideo
)
router.post(
  '/course/lesson/:slug/:instructorId',
  requireSignin,
  isInstructor,
  addLesson
)
router.put(
  '/course/lesson/:slug/:instructorId',
  requireSignin,
  isInstructor,
  updateLesson
)
// publish and unpublish
router.put(
  '/course/publish/:courseId',
  requireSignin,
  isInstructor,
  publishCourse
)
router.put(
  '/course/unpublish/:courseId',
  requireSignin,
  isInstructor,
  unpublishCourse
)

// update course
router.put('/course/:slug', requireSignin, update)
router.put('/course/:slug/:lessonId', requireSignin, removeLesson)

// enrollment
router.post('/free-enrollment/:courseId', requireSignin, freeEnrollment)
router.post('/paid-enrollment/:courseId', requireSignin, paidEnrollment)
router.get('/stripe-success/:courseId', requireSignin, stripeSuccess)

// get user course
router.get('/user-courses', requireSignin, userCourses)
router.get('/user/course/:slug', requireSignin, isEnrolled, read)

// completed lesson
router.post('/mark-completed', requireSignin, markCompleted)
router.post('/list-completed', requireSignin, listCompleted)
router.post('/mark-incompleted', requireSignin, markInCompleted)

// student count
router.post(
  '/instructor/student-count',
  requireSignin,

  studentCount
)

router.post('/course/get-signedurl', getSignedUrl)

router.get('/user/enrollment-history', requireSignin, getHistory)

module.exports = router
