import mongoose from 'mongoose'
const { Schema } = mongoose
const { ObjectId } = mongoose.Schema
import { generateUniqueReferralCode } from '../utils/referalCode.js'

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ['local', 'facebook', 'google', 'apple'],
      default: 'local',
    },
    providerId: { type: String, unique: true, sparse: true }, // Unique identifier from the OAuth2 provider
    tokenVersion: {
      type: Number,
      default: 0,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      min: 8,
      max: 64,
    },
    referralCode: {
      type: String,
      unique: true,
      default: function () {
        return generateUniqueReferralCode() // A function that returns a unique referral code.
      },
    },
    promotion: {
      type: Boolean,
      default: false,
    },
    picture: {},
    role: {
      type: [String],
      default: ['Subscriber'],
      enum: ['Subscriber', 'Instructor', 'Admin', 'Pending'],
    },
    website: {
      type: String,
    },
    youtube: {
      type: String,
    },
    facebook: {
      type: String,
    },
    instagram: {
      type: String,
    },
    twitter: {
      type: String,
    },
    wechat: {
      type: String,
    },
    tiktok: {
      type: String,
    },
    biography: {
      type: String,
    },
    ageRange: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    gender: {
      type: String,
    },
    courseDetails: {
      type: String,
    },
    teachingExperience: {
      type: String,
    },
    shareRatio: {
      directLink: {
        us: { type: Number, default: 10 },
        instructor: { type: Number, default: 90 },
      },
      websiteDiscover: {
        us: { type: Number, default: 30 },
        instructor: { type: Number, default: 70 },
      },
    },

    stripe_account_id: '',
    stripe_seller: {},
    stripeSession: {},
    passwordResetCode: {
      data: String,
      default: '',
    },
    courses: [{ type: ObjectId, ref: 'Course' }],
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
