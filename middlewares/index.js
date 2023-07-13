import { expressjwt } from 'express-jwt'
import User from '../models/user'
import Course from '../models/course'
import passport from '../passport'

export const requireSignin = (req, res, next) => {
  if (req.cookies.token) {
    expressjwt({
      getToken: (req) => req.cookies.token,
      secret: process.env.JWT_SECRET,
      algorithms: ['HS256'],
    })(req, res, async (err) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Retrieve the user from the database
      const user = await User.findById(req.auth._id)

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Check if the token version is valid
      if (req.auth.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // If everything is fine, proceed to the next middleware
      next()
    })
  } else {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

export const isInstructor = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth._id).exec()
    if (!user.role.includes('Instructor')) {
      return res.sendStatus(403)
    } else {
      next()
    }
  } catch (err) {
    console.log(err)
  }
}

export const isEnrolled = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth._id).exec()
    const course = await Course.findOne({ slug: req.params.slug }).exec()
    // check if course id is found in user courses array
    let ids = []
    for (let i = 0; i < user.courses.length; i++) {
      ids.push(user.courses[i].toString())
    }
    if (!ids.includes(course._id.toString())) {
      return res.sendStatus(403)
    } else {
      next()
    }
  } catch (err) {
    console.log(err)
  }
}

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth._id).exec()
    if (!user.role.includes('Admin')) {
      return res.sendStatus(403)
    } else {
      next()
    }
  } catch (err) {
    console.log(err)
  }
}
