import Quiz from '../models/quiz'
import StudentResponse from '../models/quizResponse'

export const createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz(req.body)
    await quiz.save()
    res.status(201).json(quiz)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
    res.status(200).json(quizzes)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }
    res.status(200).json(quiz)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }
    res.status(200).json(quiz)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }
    res.status(200).json({ message: 'Quiz deleted' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    quiz.questions.push(req.body)
    await quiz.save()

    res.status(201).json({ message: 'Question added', question: req.body })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    const questionIndex = quiz.questions.findIndex(
      (question) => question._id.toString() === req.params.questionId
    )

    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' })
    }

    quiz.questions.splice(questionIndex, 1)
    await quiz.save()

    res.status(200).json({ message: 'Question deleted' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const updateQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    const questionIndex = quiz.questions.findIndex(
      (question) => question._id.toString() === req.params.questionId
    )

    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' })
    }

    quiz.questions[questionIndex] = req.body
    await quiz.save()

    res.status(200).json({ message: 'Question updated', question: req.body })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const generateRandomQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    const questionCount = Math.min(
      quiz.questions.length,
      quiz.reservedQuestions.length
    )
    const randomQuestions = []

    for (let i = 0; i < questionCount; i++) {
      const randomIndex = Math.floor(
        Math.random() * quiz.reservedQuestions.length
      )
      const selectedQuestion = quiz.reservedQuestions.splice(randomIndex, 1)[0]
      randomQuestions.push(selectedQuestion)
    }

    res.status(200).json(randomQuestions)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const addReservedQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    const question = quiz.questions.id(req.params.questionId)
    if (!question) {
      return res.status(404).json({ error: 'Question not found' })
    }

    quiz.reservedQuestions.push(question)
    await quiz.save()

    res.status(201).json({ message: 'Question reserved' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteAnswer = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    const questionIndex = quiz.questions.findIndex(
      (question) => question._id.toString() === req.params.questionId
    )

    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' })
    }

    const answerIndex = quiz.questions[questionIndex].answers.findIndex(
      (answer) => answer._id.toString() === req.params.answerId
    )

    if (answerIndex === -1) {
      return res.status(404).json({ error: 'Answer not found' })
    }

    quiz.questions[questionIndex].answers.splice(answerIndex, 1)
    await quiz.save()

    res.status(200).json({ message: 'Answer deleted' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const addAnswer = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    const questionIndex = quiz.questions.findIndex(
      (question) => question._id.toString() === req.params.questionId
    )

    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' })
    }

    quiz.questions[questionIndex].answers.push(req.body)
    await quiz.save()

    res.status(201).json({ message: 'Answer added', answer: req.body })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.body.quizId)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    const studentResponse = new StudentResponse({
      quizId: req.body.quizId,
      studentName: req.body.studentName,
      answers: req.body.answers,
    })

    let correctAnswers = 0
    studentResponse.answers.forEach((answer) => {
      const question = quiz.questions.id(answer.questionId)
      if (question) {
        const isCorrect = answer.selectedAnswers.every(
          (selectedAnswerIndex, i) => {
            return question.answers[selectedAnswerIndex].isCorrect
          }
        )

        if (isCorrect) {
          correctAnswers++
        }
      }
    })

    studentResponse.score = (correctAnswers / quiz.questions.length) * 100
    await studentResponse.save()

    res
      .status(201)
      .json({ message: 'Quiz submitted', score: studentResponse.score })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
