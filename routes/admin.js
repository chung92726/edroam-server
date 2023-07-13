import express from "express"
import { requireSignin } from "../middlewares/index"
import { currentAdmin, AllTransactions } from "../controllers/admin"
const router = express.Router()

router.get("/is-admin", requireSignin, currentAdmin)
router.get("/admin/transactions", requireSignin, AllTransactions)

module.exports = router
