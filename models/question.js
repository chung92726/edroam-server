const mongoose = require('mongoose')

const AnswerSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'instructor'],
      default: 'user',
    },
    answeredByInstructor: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
)

const QuestionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessonIndex: {
      type: Number,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 4000,
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [AnswerSchema],
  },
  {
    timestamps: true,
  }
)

QuestionSchema.index({ title: 'text', content: 'text' })

export default mongoose.model('Question', QuestionSchema)
