import express from 'express'

import { isInstructor, requireSignin } from '../middlewares/index'
import {
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} from '../controllers/coupon'
import { validCoupon } from '../middlewares'

const router = express.Router()

router.post('/coupon', requireSignin, isInstructor, createCoupon)
router.get('/coupon/:code', getCoupon)
router.put('/coupon/:code', requireSignin, isInstructor, updateCoupon)
router.delete('/coupon/:code', requireSignin, isInstructor, deleteCoupon)
router.post('/apply-coupon/:courseId', requireSignin, validCoupon, applyCoupon)

module.exports = router
