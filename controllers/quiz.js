import Quiz from '../models/quiz'
import StudentResponse from '../models/quizResponse'
import Course from '../models/course'

export const createQuiz = async (req, res) => {
  try {
    const { title, description, passingRate, course, lesson, coursePassing } =
      req.body

    const userId = req.auth._id
    const Or_Course = await Course.findById(course)

    if (!Or_Course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    if (Or_Course.instructor.toString() != userId.toString()) {
      return res.status(401).json({ error: 'You are not authorized' })
    }

    // Find the lesson within the course
    const Or_Lesson = Or_Course.lessons.find(
      (lessonItem) => lessonItem._id.toString() === lesson
    )

    if (!Or_Lesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }

    const quiz = new Quiz({
      title,
      description,
      passingRate,
      courseId: course,
      lessonId: lesson,
      lessonTitle: Or_Lesson.title, // Use the title from the lesson
      courseTitle: Or_Course.name,
      coursePassingQuiz: coursePassing,
      instructorId: userId,
    })
    await quiz.save()
    res.status(201).json(quiz)
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error.message })
  }
}

export const getQuizzes = async (req, res) => {
  const userId = req.auth._id
  const { search } = req.query

  try {
    const searchRegex = new RegExp(search, 'i') // case-insensitive search

    // Search in Quiz model
    const quizzes = await Quiz.find({
      instructorId: userId,
      $or: [
        { title: searchRegex },
        { courseTitle: searchRegex },
        { lessonTitle: searchRegex },
      ],
    })

    res.status(200).json(quizzes)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    res.status(200).json(quiz)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const updateQuiz = async (req, res) => {
  const { title, description, passingRate, course, lesson, coursePassing } =
    req.body
  console.log(req.params.quizId)
  try {
    const quiz_check = await Quiz.findById(req.params.quizId)
    if (!quiz_check) {
      return res.status(404).json({ error: 'Quiz not found' })
    }
    if (quiz_check.instructorId.toString() != req.auth._id.toString()) {
      return res.status(401).json({ error: 'You are not authorized' })
    }

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      {
        title,
        description,
        passingRate,
        courseId: course,
        lessonId: lesson,
        coursePassingQuiz: coursePassing,
      },
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(200).json(quiz)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteQuiz = async (req, res) => {
  try {
    const quiz_check = await Quiz.findById(req.params.quizId)
    if (!quiz_check) {
      return res.status(404).json({ error: 'Quiz not found' })
    }
    if (quiz_check.instructorId.toString() != req.auth._id.toString()) {
      return res.status(401).json({ error: 'You are not authorized' })
    }
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId)

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

export const publishQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId
    const quiz = await Quiz.findById(quizId)

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }
    if (quiz.published) {
      return res.status(400).json({ error: 'Quiz already published' })
    }
    if (quiz.instructorId.toString() !== req.auth._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Ensure the quiz has at least one question
    if (quiz.questions.length < 1) {
      return res.status(400).json({
        error:
          'Quiz must contain at least one question before it can be published',
      })
    }

    // Update the published field
    quiz.published = true
    await quiz.save()

    res.status(200).json(quiz)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
}

export const unpublishQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId
    const quiz = await Quiz.findById(quizId)

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' })
    }
    if (!quiz.published) {
      return res.status(400).json({ error: 'Quiz already unpublished' })
    }
    if (quiz.instructorId.toString() !== req.auth._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Update the published field
    quiz.published = false
    await quiz.save()

    res.status(200).json(quiz)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
}
