import express from "express"
import {
  register,
  login,
  logout,
  currentUser,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/auth"
import { requireSignin } from "../middlewares/index"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/logout", logout)
router.get("/current-user", requireSignin, currentUser)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post("/user/change-password", requireSignin, changePassword)

module.exports = router
