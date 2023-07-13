import mongoose from "mongoose"
const { Schema } = mongoose
const { ObjectId } = mongoose.Schema

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
    password: {
      type: String,
      required: true,
      min: 8,
      max: 64,
    },
    promotion: {
      type: Boolean,
      default: false,
    },
    picture: {},
    role: {
      type: [String],
      default: ["Subscriber"],
      enum: ["Subscriber", "Instructor", "Admin", "Pending"],
    },
    website: {
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

    stripe_account_id: "",
    stripe_seller: {},
    stripeSession: {},
    passwordResetCode: {
      data: String,
      default: "",
    },
    courses: [{ type: ObjectId, ref: "Course" }],
  },
  { timestamps: true }
)

export default mongoose.model("User", userSchema)
