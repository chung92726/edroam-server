import passport from 'passport'
import FacebookStrategy from 'passport-facebook'
import GoogleStrategy from 'passport-google-oauth20'
import AppleStrategy from 'passport-apple'
import User from './models/user'
import { register, login } from './controllers/auth'
const jwt = require('jsonwebtoken')
import { hashPassword } from './utils/auth'
require('dotenv').config()

async function facebookCallback(accessToken, refreshToken, profile, done) {
  try {
    const user = await User.findOne({ email: profile._json.email }).exec()
    console.log(profile)
    if (user) {
      const updateProfilePic = await User.findOneAndUpdate(
        { email: profile._json.email },
        { 'picture.Location': profile.photos[0].value }
      )
      // User already exists, log them in
      done(null, updateProfilePic)
    } else {
      // Register a new user
      const newUser = new User({
        name: profile.displayName,
        email: profile._json.email,
        password: await hashPassword(generateRandomPassword()),
        provider: 'facebook',
        'picture.Location': profile.photos[0].value,
        providerId: profile.id,
      })

      await newUser.save()
      done(null, newUser)
    }
  } catch (error) {
    done(error, false)
  }
}

// Google Strategy callback
async function googleCallback(accessToken, refreshToken, profile, done) {
  try {
    const user = await User.findOne({ email: profile.emails[0].value }).exec()

    if (user) {
      // User already exists, log them in
      done(null, user)
    } else {
      // Register a new user
      const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: await hashPassword(generateRandomPassword()),
        provider: 'google',
        'picture.Location': profile.photos[0].value,
        providerId: profile.id,
      })

      await newUser.save()
      done(null, newUser)
    }
  } catch (error) {
    done(error, false)
  }
}

function generateRandomPassword() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

// Replace the existing callbacks in your Passport strategies with the callbacks provided here

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'email', 'picture.type(large)'],
    },
    facebookCallback
  )
)

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    googleCallback
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

export default passport
