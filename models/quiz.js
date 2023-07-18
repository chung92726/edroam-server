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
    maxlength: 1000,
  },
})
function multipleCorrectAnswersOrSingleAnswer(val) {
  if (this.multipleCorrectAnswers) {
    return val.filter((answer) => answer.isCorrect).length >= 2
  } else {
    return val.filter((answer) => answer.isCorrect).length === 1
  }
}

function arrayLimit(val) {
  return val.length >= 2 && val.length <= 8
}
const questionSchema = new Schema({
  text: {
    type: String,
    trim: true,
    required: true,
  },
  multipleCorrectAnswers: {
    type: Boolean,
    default: false,
  },
  answers: {
    type: [answerSchema],
    validate: [arrayLimit, 'Answers must be between 2 and 8.'],
    validate: [
      multipleCorrectAnswersOrSingleAnswer,
      'At least two answers must be correct.',
    ],
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
    courseTitle: {
      type: String,
    },
    lessonId: {
      type: ObjectId,
    },
    lessonTitle: {
      type: String,
    },

    instructorId: {
      type: ObjectId,
      ref: 'User',
    },
    useRandomQuestions: {
      type: Boolean,
      default: false,
    },
    randomQuestionsNumber: {
      type: Number,
      default: 0,
      min: 0,
    },
    coursePassingQuiz: {
      type: Boolean,
      default: false,
    },
    questions: [questionSchema],
    reservedQuestions: [questionSchema],
    passingRate: {
      type: Number,
      default: 50,
      min: 10,
      max: 100,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Quiz', quizSchema)
