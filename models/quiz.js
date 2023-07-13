import mongoose from 'mongoose'
const { Schema } = mongoose
const { ObjectId } = mongoose.Schema

const answerSchema = new Schema({
  text: {
    type: String,
    trim: true,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  explanation: {
    type: String,
    trim: true,
  },
})

function arrayLimit(val) {
  return val.length >= 2 && val.length <= 8
}
const questionSchema = new Schema({
  text: {
    type: String,
    trim: true,
    required: true,
  },
  answers: {
    type: [answerSchema],
    validate: [arrayLimit, 'Answers must be between 2 and 8.'],
  },
  overallExplanation: {
    type: String,
    trim: true,
  },
})

const quizSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
    courseId: {
      type: ObjectId,
      ref: 'Course',
    },
    questions: [questionSchema],
    reservedQuestions: [questionSchema],
    passingRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Quiz', quizSchema)
