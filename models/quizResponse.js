const mongoose = require('mongoose')

const responseSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      selectedAnswers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      ],
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
  pass: {
    type: Boolean,
    default: false,
  },
})

module.exports = mongoose.model('StudentResponse', responseSchema)
