import express from 'express'
import { requireSignin } from '../middlewares/index'
import { currentAdmin } from '../controllers/admin'
const router = express.Router()

router.get('/is-admin', requireSignin, currentAdmin)

module.exports = router
