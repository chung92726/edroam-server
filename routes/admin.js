import express from "express"
import { requireSignin, isAdmin } from "../middlewares/index"
import {
  currentAdmin,
  readAllCourse,
  deleteCourse,
  readCourse,
  publishCourse,
  unpublishCourse,
  deleteLesson,
  readLesson,
  getStudents,
  removeStudentFromCourse,
  getMember,
  getMemberCreatedCourses,
  banUser,
  unBanUser,
  getAllUsers,
  deleteUser,
} from "../controllers/admin"

const router = express.Router()

router.get("/is-admin", requireSignin, currentAdmin)
router.get("/admin/courses", requireSignin, isAdmin, readAllCourse)
router.delete("/admin/courses/:slug", requireSignin, isAdmin, deleteCourse)
router.get("/admin/course/:slug", requireSignin, isAdmin, readCourse)
router.put(
  "/admin/course/publish/:courseId",
  requireSignin,
  isAdmin,
  publishCourse
)
router.put(
  "/admin/course/unpublish/:courseId",
  requireSignin,
  isAdmin,
  unpublishCourse
)
router.delete(
  "/admin/lesson/:courseId/:lessonId",
  requireSignin,
  isAdmin,
  deleteLesson
)
router.get(
  "/admin/course/:courseSlug/:lessonSlug",
  requireSignin,
  isAdmin,
  readLesson
)

router.post("/admin/course/students", requireSignin, isAdmin, getStudents)
router.delete(
  `/admin/course/:courseId/remove-student/:studentId`,
  requireSignin,
  isAdmin,
  removeStudentFromCourse
)
router.get("/admin/member/:userId", requireSignin, isAdmin, getMember)

router.get(
  "/admin/member-created/:userId",
  requireSignin,
  isAdmin,
  getMemberCreatedCourses
)

router.put("/admin/ban-user/:userId", requireSignin, isAdmin, banUser)
router.put("/admin/unban-user/:userId", requireSignin, isAdmin, unBanUser)
router.delete("/admin/delete-user/:userId", requireSignin, isAdmin, deleteUser)

router.get("/admin/get-all-users", requireSignin, isAdmin, getAllUsers)

module.exports = router
