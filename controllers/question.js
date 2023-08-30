import Question from '../models/question.js'
import User from '../models/user.js'
import Course from '../models/course.js'
import { sendEmail } from '../services/emailService.js'

export const getQuestion = async (req, res) => {
  try {
    const {
      courseId,
      lessonIndex,
      limit = 100000,
      page = 1,
      search,
      unansweredByInstructor,
      instructorQuery,
      sortBy,
    } = req.query

    console.log(sortBy)

    const instructorId = req.auth._id

    const skip = (parseInt(page) - 1) * parseInt(limit)
    let query = {}

    if (courseId) {
      query.courseId = courseId
    }
    if (instructorQuery === 'true') {
      query.instructor = instructorId
    }

    if (lessonIndex !== undefined) {
      query.lessonIndex = lessonIndex
    }

    let andConditions = []

    if (search) {
      andConditions.push({
        $or: [{ title: { $regex: search, $options: 'i' } }],
      })
    }

    if (unansweredByInstructor === 'true') {
      query.answers = { $size: 0 }
      andConditions.push({ answeredByInstructor: false })
    }
    if (andConditions.length > 0) {
      query.$and = andConditions
    }

    // Define sort options
    let sortOptions = { updatedAt: -1 } // Default sorting by last reply (descending)
    if (sortBy === 'creationTime') {
      sortOptions = { createdAt: -1 } // Sort by question creation time (descending)
    }

    const questions = await Question.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOptions)
      .populate('askedBy', 'name picture')
      .populate('answers.answeredBy', 'name picture role')
      .populate('courseId', 'name lessons')

    const totalCount = await Question.countDocuments(query)

    res.status(200).json({ questions, totalCount })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const askQuestion = async (req, res) => {
  const { courseId, lessonIndex } = req.params
  const { title, details, instructorId } = req.body

  try {
    const question = await Question.create({
      courseId: courseId,
      lessonIndex: lessonIndex,
      title: title,
      content: details,
      askedBy: req.auth._id,
      instructor: instructorId,
    })
    const instructor = await User.findById(instructorId)
    const course = await Course.findById(courseId)

    await sendEmail(
      instructor.email,
      course.name,
      lessonIndex,
      'http://localhost:3000/instructor/allquestions'
    )

    res.status(200).json(question)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const answerQuestion = async (req, res) => {
  try {
    const { comment } = req.body
    const answeredBy = req.auth._id
    const { questionId } = req.params

    const question_temp = await Question.findById(questionId)
    const role =
      question_temp.instructor.toString() === answeredBy.toString()
        ? 'instructor'
        : 'user'
    console.log(role)
    const answeredByInstructor = role === 'instructor' ? true : false
    console.log(answeredByInstructor)

    const answer = {
      content: comment,
      answeredBy,
      role: role,
    }

    const question = await Question.findByIdAndUpdate(
      questionId,
      { $push: { answers: answer } },
      { new: true, upsert: true }
    )
      .populate('askedBy', 'name picture')
      .populate('answers.answeredBy', 'name picture role _id')

    res.status(200).json(question)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Question deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const deleteAnswer = async (req, res) => {
  try {
    const { answerId } = req.params
    const updatedQuestion = await Question.findOneAndUpdate(
      { 'answers._id': answerId },
      { $pull: { answers: { _id: answerId } } },
      { new: true }
    )
    res.status(200).json(updatedQuestion)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
