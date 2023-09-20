import mongoose from 'mongoose'
const { Schema } = mongoose
const { ObjectId } = mongoose.Schema
import { generateUniqueReferralCode } from '../utils/referalCode.js'

const couponSchema = new Schema({
  name: {
    type: String,
    trim: true,
    maxlength: 32,
  },
  code: {
    type: String,
    unique: true,
    required: true,
    default: () => generateUniqueReferralCode((length = 12)),
    length: 12,
  },
  discountType: {
    type: String,
    default: 'Percentage',
    enum: ['Percentage', 'Fixed'],
  },
  discount: {
    type: Number,
    required: true,
  },
  expiration: {
    type: Boolean,
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTo: {
    type: Date,
    required: true,
  },
  coursesValidFor: [
    {
      type: ObjectId,
      ref: 'Course',
    },
  ],
  usageLimit: {
    type: Number,
    default: null, // No limit by default
  },
  timesUsed: {
    type: Number,
    default: 0,
  },
})

export default mongoose.model('Coupon', couponSchema)
