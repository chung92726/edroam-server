import User from '../models/user'
import Course from '../models/course'
const stripe = require('stripe')(process.env.STRIPE_SECRET)

export const currentAdmin = async (req, res) => {
  console.log(req.auth)
  try {
    let user = await User.findById(req.auth._id).select('-password').exec()
    if (!user.role.includes('Admin')) {
      return res.status(403).send('Unauthorized')
    } else {
      res.json({ ok: true })
    }
  } catch (err) {
    return res.status(403).send('Unauthorized')
  }
}

export const AllTransactions = async (req, res) => {
  try {
    let user = await User.findById(req.auth._id).select('-password').exec()
    if (!user.role.includes('Admin')) {
      return res.status(403).send('Unauthorized')
    }
  } catch (err) {
    return res.status(403).send('Unauthorized')
  }

  try {
    const balanceTransactions = await stripe.balanceTransactions.list({
      limit: 100,
    })
    // console.log(balanceTransactions)
    while (balanceTransactions.has_more) {
      console.log('has more')
      const more = await stripe.balanceTransactions.list({
        limit: 100,
        starting_after:
          balanceTransactions.data[balanceTransactions.data.length - 1].id,
      })
      balanceTransactions.data.push(...more.data)
      balanceTransactions.has_more = more.has_more
    }
    // console.log(balanceTransactions.data)
    const filtered = balanceTransactions.data.filter((item) => {
      // console.log(item.reporting_category)
      return item.reporting_category == 'platform_earning'
    })
    res.json(filtered)
  } catch (err) {
    console.log(err)
  }
}

export const approveIntructor = async (req, res) => {
  // console.log(req.auth)
  try {
    const updatedUser = User.findOneAndUpdate(
      { _id: req.auth._id, role: 'Pending' }, // Specify the user ID and current role
      { $set: { role: 'Instructor' } }, // Set the new role
      { new: true }
    ).select('-password')

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: 'User not found or role is not pending' })
    }

    res.json(updatedUser)
  } catch (err) {
    res.status(500).json({ message: 'Error occurred while updating user role' })
  }
}

export const readAllCourse = async (req, res) => {
  try {
    const { search, instructorSearch } = req.query
    console.log(search, instructorSearch)

    let pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'instructor',
          foreignField: '_id',
          as: 'instructor',
        },
      },
      {
        $unwind: {
          path: '$instructor',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]

    if (search) {
      pipeline.push({
        $match: {
          name: { $regex: search, $options: 'i' },
        },
      })
    }

    if (instructorSearch) {
      pipeline.push({
        $match: {
          'instructor.name': { $regex: instructorSearch, $options: 'i' },
        },
      })
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          published: 1,

          TotalRevenue: { $ifNull: ['$TotalRevenue', 0] },
          createdAt: 1,
          instructor: { _id: 1, name: 1 },
        },
      }
    )

    let courses = await Course.aggregate(pipeline).exec()
    res.json(courses)
  } catch (err) {
    console.log(err)
    res.status(400).send('Create course failed. Try again.')
  }
}

export const deleteCourse = async (req, res) => {
  try {
    console.log(req.params.slug)

    let course = await Course.findOneAndDelete({ slug: req.params.slug }).exec()
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send('Delete course failed. Try again.')
  }
}

export const readCourse = async (req, res) => {
  try {
    let course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', '_id name')
      .exec()
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send('Create course failed. Try again.')
  }
}

export const publishCourse = async (req, res) => {
  try {
    let course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { published: true },
      { new: true }
    )
      .populate('instructor', '_id name')
      .exec()
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send('Publish course failed. Try again.')
  }
}

export const unpublishCourse = async (req, res) => {
  try {
    let course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { published: false },
      { new: true }
    )
      .populate('instructor', '_id name')
      .exec()
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send('Unpublish course failed. Try again.')
  }
}

export const deleteLesson = async (req, res) => {
  try {
    console.log(req.params.courseId, req.params.lessonId)

    let course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $pull: { lessons: { _id: req.params.lessonId } } },
      { new: true }
    )
      .populate('instructor', '_id name')
      .exec()
    res.json(course)
  } catch (err) {
    console.log(err)
    res.status(400).send('Delete lesson failed. Try again.')
  }
}

export const readLesson = async (req, res) => {
  try {
    console.log(req.params.courseSlug, req.params.lessonSlug)

    let course = await Course.findOne({ slug: req.params.courseSlug })
      .populate('instructor', '_id name')
      .exec()
    let lesson = course.lessons.find(
      (lesson) => lesson.slug === req.params.lessonSlug
    )
    console.log(lesson)
    res.json(lesson)
  } catch (err) {
    console.log(err)
    res.status(400).send('Read lesson failed. Try again.')
  }
}

export const getStudents = async (req, res) => {
  try {
    let users = await User.find({ courses: req.body.courseId })
      .populate('courses', '_id name')
      .exec()
    res.json(users)
  } catch (err) {
    console.log(err)
    res.status(400).send('Get students failed. Try again.')
  }
}

export const removeStudentFromCourse = async (req, res) => {
  try {
    const { courseId, studentId } = req.params

    // Remove course from the user's courses
    const user = await User.findByIdAndUpdate(
      studentId,
      { $pull: { courses: courseId } },
      { new: true }
    ).exec()

    // Remove user from the course's EnrolledUser field
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $pull: { EnrolledUser: studentId } },
      { new: true }
    ).exec()

    res.json({ message: 'User removed from course successfully', user, course })
  } catch (err) {
    console.log(err)
    res.status(400).send('Remove student from course failed. Try again.')
  }
}

export const getMember = async (req, res) => {
  try {
    let users = await User.findById(req.params.userId)
      .populate({
        path: 'courses',
        select: '_id slug paid name price level language instructor',
        populate: {
          path: 'instructor',
          select: '_id name',
        },
      })
      .exec()
    res.json(users)
  } catch (err) {
    console.log(err)
    res.status(400).send('Get member failed. Try again.')
  }
}

export const getMemberCreatedCourses = async (req, res) => {
  try {
    let courses = await Course.find({ instructor: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('instructor', '_id name')
      .exec()
    res.json(courses)
  } catch (err) {
    console.log(err)
    res.status(400).send('Get member created courses failed. Try again.')
  }
}

export const banUser = async (req, res) => {
  try {
    const { userId } = req.params

    // Update user's banned status to true and increment tokenVersion
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: { banned: true },
        $inc: { tokenVersion: 1 },
      },
      { new: true }
    ).exec()

    res.json({ message: 'User banned successfully', user })
  } catch (err) {
    console.log(err)
    res.status(400).send('Ban user failed. Try again.')
  }
}

export const unBanUser = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: { banned: false },
        $inc: { tokenVersion: 1 },
      },
      { new: true }
    )

    res.json({ message: 'User unbanned successfully', user })
  } catch (err) {
    console.log(err)
    res.status(400).send('Unban user failed. Try again.')
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const { searchTerm } = req.query

    const searchQuery = searchTerm
      ? {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
          ],
        }
      : {}

    let users = await User.find(searchQuery)
      .populate('courses', '_id name')
      .exec()

    res.json(users)
  } catch (err) {
    console.log(err)
    res.status(400).send('Get all users failed. Try again.')
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    // Remove user from the course's EnrolledUser field
    const user = await User.findByIdAndDelete(userId).exec()

    res.json({ message: 'User deleted successfully', user })
  } catch (err) {
    console.log(err)
    res.status(400).send('Delete user failed. Try again.')
  }
}
