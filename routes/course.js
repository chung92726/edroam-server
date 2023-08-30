import express from 'express'
import formidable from 'express-formidable'

import {
  requireSignin,
  isInstructor,
  isEnrolled,
  isVerifiedInstructor,
} from '../middlewares/index'
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
  uploadSupplementary,
  removeSupplementary,
  removeupdateSupplementary,
  getS3File,
  category,
  getLessonByCourseId,
  serchAndFilter,
  instructorRead,
} from '../controllers/course'

const router = express.Router()

router.get('/courses', courses)
// router.get('/courses/:category', category)
router.get('/courses/search/', serchAndFilter)

router.post('/course/upload-image', requireSignin, uploadImage)
router.post('/course/remove-image', requireSignin, removeImage)

router.get('/check-enrollment/:courseId', requireSignin, checkEnrollment)

//course
router.post('/course', requireSignin, isInstructor, create)
router.get('/course/:slug', read)
router.get(
  '/course/instuctor/:slug',
  requireSignin,
  isInstructor,
  instructorRead
)

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
  isVerifiedInstructor,
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

router.post(
  '/course/supplementary-upload/:instructorId',
  requireSignin,
  formidable(),
  uploadSupplementary
)

router.post(
  '/course/supplementary-remove/:instructorId',
  requireSignin,
  removeSupplementary
)

router.post(
  '/course/supplementary-update-remove/:instructorId/:lessonId',
  requireSignin,
  removeupdateSupplementary
)

router.get('/course/supplementary-download/:fileId', requireSignin, getS3File)

router.get('/course/lessons/:courseId', requireSignin, getLessonByCourseId)

module.exports = router
