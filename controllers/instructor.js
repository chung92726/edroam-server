import User from '../models/user'
import Enrolled from '../models/enrolled'
const stripe = require('stripe')(process.env.STRIPE_SECRET)
var querystring = require('querystring')
import Course from '../models/course'
const _ = require('lodash')

export const makeInstructor = async (req, res) => {
  // 1. find user from db
  try {
    const user = await User.findById(req.body._id).exec()
    // 2. if user dont have stripe_account_id yet, then create new
    // console.log('USER ==> ', user)

    const {
      // picture,
      name,
      // website,
      biography,
      // gender,
      // ageRange,
      phoneNumber,
      courseDetails,
      teachingExperience,
    } = user

    const info = {
      // picture,
      name,
      // website,
      biography,
      // gender,
      // ageRange,
      phoneNumber,
      courseDetails,
      teachingExperience,
    }

    for (const prop in info) {
      if (
        info[prop] === null ||
        info[prop] === '' ||
        info[prop] === undefined
      ) {
        console.log('missing: ' + prop)
      }
    }

    //validation
    if (
      // !user.picture ||
      !user.name ||
      // !user.website ||
      !user.biography ||
      // !user.gender ||
      // !user.ageRange ||
      !user.phoneNumber ||
      !user.courseDetails ||
      !user.teachingExperience
    ) {
      return res.status(400).send('Profile not completed')
    }

    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        default_currency: 'USD',
      })
      console.log('ACCOUNT => ', account.id)
      user.stripe_account_id = account.id
      user.save()
    }
    // 3. create account link based on account id (for frontend to complete onboarding)
    let accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL,
      return_url: process.env.STRIPE_REDIRECT_URL,
      type: 'account_onboarding',
    })
    // 4. prefill any info such as email (optional), then send url response to frontend\
    accountLink = Object.assign(accountLink, {
      'stripe_user[email]': user.email,
    })
    // 5. then send the account link as response to fronend
    res.send(`${accountLink.url}?${querystring.stringify(accountLink)}`)
  } catch (err) {
    console.log('MAKE INSTRUCTOR ERR ', err)
  }
}

export const getAccountStatus = async (req, res) => {
  try {
    const user = await User.findById(req.body._id).exec()
    const account = await stripe.accounts.retrieve(user.stripe_account_id)

    if (!account.charges_enabled) {
      return res
        .status(401)
        .send('receive payment Unauthorized please update your stripe account')
    } else {
      const statusUpdated = await User.findByIdAndUpdate(
        user._id,
        {
          stripe_seller: account,
          $addToSet: { role: 'Pending' }, // addtoSet will only add if the role is not already there
        },
        { new: true }
      )
        .select('-password')
        .exec()
      res.json(statusUpdated)
    }
  } catch (err) {
    console.log(err)
  }
}

export const currentInstructor = async (req, res) => {
  console.log(req.auth)
  try {
    let user = await User.findById(req.auth._id).select('-password').exec()
    if (!user.role.includes('Instructor')) {
      return res.status(403).send('Unauthorized')
    } else {
      res.json({ ok: true })
    }
  } catch (err) {
    return res.status(403).send('Unauthorized')
  }
}

export const currentPending = async (req, res) => {
  console.log(req.auth)
  try {
    let user = await User.findById(req.auth._id).select('-password').exec()
    if (!user.role.includes('Pending')) {
      return res.status(403).send('Unauthorized')
    } else {
      res.json({ ok: true })
    }
  } catch (err) {
    return res.status(403).send('Unauthorized')
  }
}

export const currentInstructorOrPending = async (req, res) => {
  console.log(req.auth)
  try {
    let user = await User.findById(req.auth._id).select('-password').exec()
    if (user.role.includes('Instructor') || user.role.includes('Pending')) {
      res.json({ ok: true })
    } else {
      return res.status(403).send('Unauthorized')
    }
  } catch (err) {
    return res.status(403).send('Unauthorized')
  }
}

export const instructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.auth._id })
      .sort({ createdAt: -1 })
      .exec()
    res.json(courses)
  } catch (err) {
    console.log(err)
  }
}

export const instructorBalance = async (req, res) => {
  try {
    let user = await User.findById(req.auth._id).exec()
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    })
    console.log(balance)
    res.json(balance)
  } catch (err) {
    console.log(err)
  }
}

export const instructorPayoutSettings = async (req, res) => {
  try {
    let user = await User.findById(req.auth._id).exec()
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripe_seller.id,
      {
        redirect_url: process.env.STRIPE_SETTINGS_REDIRECT,
      }
    )
    res.json(loginLink.url)
  } catch (err) {
    console.log(err)
  }
}

export const studentCount = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.auth._id }).exec()
    const coursesIds = courses.map((course) => course._id.toString())
    const allStudents = []
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i]

      const students = await User.find({ courses: course._id })
        .select('_id name email picture courses')
        .populate('courses', '_id name')
        .exec()
      allStudents.push(...students)
    }
    const uniqueStudents = _.uniqBy(allStudents, 'email')
    console.log('UNIQUE STUDENTS => ', uniqueStudents)
    // exclude email and not related courses from uniqueStudents
    for (let i = 0; i < uniqueStudents.length; i++) {
      const student = uniqueStudents[i]
      const finalCourses = []
      for (let j = 0; j < student.courses.length; j++) {
        const course = student.courses[j]
        const courseString = course._id.toString()
        if (coursesIds.includes(courseString)) {
          finalCourses.push(course)
        }
      }
      uniqueStudents[i].courses = finalCourses

      student.email = undefined
    }
    console.log('new unique', uniqueStudents)

    res.json(uniqueStudents)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Student count failed')
  }
}

export const getAllEnrolled = async (req, res) => {
  try {
    const history = await Enrolled.find({ instructor: req.auth._id })
      .populate('course', '_id name picture')
      .populate('user', '_id name picture')
      .exec()
    // console.log(history)
    res.json(history)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Get history failed')
  }
}

export const getRevenue = async (req, res) => {
  try {
    const courseId = req.params.courseId
    const history = await Enrolled.find({
      instructor: req.auth._id,
      course: courseId,
    }).exec()

    let totalRevenue = 0
    history.map((item) => {
      totalRevenue = (Number(totalRevenue) + Number(item.price) * 0.7).toFixed(
        2
      )
    })
    return res.json({ totalRevenue })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Get Revenue Fail')
  }
}
