import express from "express"
import { update, instructorUpdated } from "../controllers/user"
import { requireSignin } from "../middlewares/index"

const router = express.Router()

router.post("/user/updateInfo", requireSignin, update)
router.post("/user/updateInstructorInfo", requireSignin, instructorUpdated)

module.exports = router
