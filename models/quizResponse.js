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
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      selectedAnswers: [
        {
          type: Number,
          required: true,
        },
      ],
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
})

module.exports = mongoose.model('StudentResponse', responseSchema)
