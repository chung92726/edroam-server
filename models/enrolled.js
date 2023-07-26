import mongoose from 'mongoose'
const { Schema } = mongoose
const { ObjectId } = mongoose.Schema

const enrolledSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
    },
    course: {
      type: ObjectId,
      ref: 'Course',
    },
    instructor: {
      type: ObjectId,
      ref: 'User',
    },
    price: {
      type: Number,
    },
    session: {},
  },
  { timestamps: true }
)

export default mongoose.model('Enrolled', enrolledSchema)
