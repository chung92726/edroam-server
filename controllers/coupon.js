import Coupon from '../models/coupon'
import Course from '../models/course'

// Create a new coupon

export const createCoupon = async (req, res) => {
  try {
    let coupon = await new Coupon(req.body).save()
    res.json(coupon)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Coupon creation failed')
  }
}

// Get a coupon's details
export const getCoupon = async (req, res) => {
  try {
    let coupon = await Coupon.findOne({ code: req.params.code }).exec()
    if (!coupon) return res.status(400).send('Coupon not found')
    res.json(coupon)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Failed to retrieve coupon')
  }
}

// Update a coupon
export const updateCoupon = async (req, res) => {
  try {
    let updated = await Coupon.findOneAndUpdate(
      { code: req.params.code },
      req.body,
      { new: true }
    ).exec()
    res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Coupon update failed')
  }
}

// Delete a coupon
export const deleteCoupon = async (req, res) => {
  try {
    let deleted = await Coupon.findOneAndDelete({
      code: req.params.code,
    }).exec()
    res.json({ ok: true })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Coupon deletion failed')
  }
}

// Apply a coupon to a course
export const applyCoupon = async (req, res) => {
  const { courseId } = req.params
  const course = await Course.findById(courseId).exec()
  if (!course) return res.status(400).send('Course not found')

  // Since the coupon is already validated in the middleware,
  // we can directly send the discounted price or some relevant information here.
  const finalPrice = course.price - req.coupon.discount
  res.json({
    discount: req.coupon.discount,
    finalPrice: finalPrice,
  })
}
