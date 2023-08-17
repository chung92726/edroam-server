import mongoose from 'mongoose'
const { Schema } = mongoose
const { ObjectId } = mongoose.Schema

const courseReview = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: ObjectId,
      ref: 'Course',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value',
      },
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
    },
    instructorFeedback: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

export default mongoose.model('CourseReview', courseReview)
