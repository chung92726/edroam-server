import express from 'express'
import {
  register,
  login,
  logout,
  currentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  update,
  loginWithFacebook,
  loginWithGoogle,
} from '../controllers/auth'
import { requireSignin } from '../middlewares/index'
import passport from '../passport'
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.get('/current-user', requireSignin, currentUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/user/change-password', requireSignin, changePassword)
router.post('/user/updateInfo', requireSignin, update)
router.get(
  '/auth/facebook',

  passport.authenticate('facebook', { scope: ['email'] })
)
router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook'),
  loginWithFacebook
)

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)
router.get(
  '/auth/google/callback',
  passport.authenticate('google'),
  loginWithGoogle
)

// Utility function to handle OAuth logins

module.exports = router
