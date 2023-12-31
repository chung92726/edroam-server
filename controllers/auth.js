import User from '../models/user'
import { hashPassword, comparePassword } from '../utils/auth'
import jwt from 'jsonwebtoken'
import AWS from 'aws-sdk'
import ShortUniqueId from 'short-unique-id'

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-north-1',
  apiVersion: process.env.AWS_API_VERSION,
}

const SES = new AWS.SES(awsConfig)

export const register = async (req, res) => {
  try {
    console.log(req.body)
    const { name, email, password, promotion } = req.body
    //validation
    if (!name) return res.status(400).send('Name is required')
    if (!password || password.length < 8) {
      return res
        .status(400)
        .send('Password is required and should be min 8 characters long')
    }
    if (!email) return res.status(400).send('Email is required')
    let userExist = await User.findOne({ email }).exec()
    if (userExist) return res.status(400).send('Email is taken')

    // hash the password
    const hashedPassword = await hashPassword(password)
    const user = new User({
      name,
      email,
      promotion,
      password: hashedPassword,
    })
    await user.save()
    // console.log('saved user', user)
    return res.json({ ok: true })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const login = async (req, res) => {
  try {
    // check if our db has user with that email
    const { email, password } = req.body
    const user = await User.findOne({ email }).exec()
    if (!user) return res.status(400).send('Wrong username or password')
    // check password
    if (user.banned) {
      return res
        .status(403)
        .send('Your are banned.')
        .redirect('http://localhost:3000')
    }
    const match = await comparePassword(password, user.password)
    if (!match) return res.status(400).send('Wrong username or password')
    // create signed jwt
    const token = jwt.sign(
      { _id: user._id, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )
    // return user and token to client, exclude hashed password
    user.password = undefined
    // send token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      // secure: true, // only works on https
    })
    // send user as json response
    res.json(user)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('token')
    if (req.session) {
      req.session.destroy()
    }
    return res.json({ message: 'Signout success' })
  } catch (err) {
    return res.status(400).send('Error. Try again.')
  }
}

export const currentUser = async (req, res) => {
  try {
    console.log(req.user)
    console.log(req.body)
    const user = await User.findById(req.auth._id).select('-password').exec()
    console.log('CURRENT_USER', user)
    return res.json({ ok: true })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

const sendResetEmail = async (email, shortCode, res) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [email],
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
                <html>
                <h1>Reset password link</h1>
                <p>Please use the following code to reset your password</p>
                <br/>
                <h2 style="color:red">${shortCode}</h2>
                <i>edemy.com</i>
                </html>
                `,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Password reset link',
      },
    },
  }

  const emailSent = SES.sendEmail(params).promise()
  emailSent
    .then((data) => {
      console.log(data)
      res.json({ ok: true })
    })
    .catch((err) => {
      console.log(err)
      res.json({ ok: false })
    })
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    console.log(req.body)
    const uid = new ShortUniqueId({ length: 10 })
    let shortCode = uid()
    shortCode = shortCode.toLowerCase()
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    )
    if (!user) return res.status(400).send('User not found')
    sendResetEmail(email, shortCode, res)
    // prepare for email

    // console.log(email)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body

    const user = await User.findOne({ email, passwordResetCode: code }).exec()
    if (!user) return res.status(400).send('Invalid code or email')
    const oldPassword = user.password
    const hashedPassword = await hashPassword(newPassword)
    if (oldPassword === hashedPassword)
      return res.status(400).send('New password cannot be same as old password')
    await User.findOneAndUpdate(
      {
        email,
        passwordResetCode: code,
      },
      {
        password: hashedPassword,
        passwordResetCode: '',
      }
    ).exec()
    res.json({ ok: true })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body
    if (newPassword !== confirmPassword) {
      console.log('Passwords do not match')
      return res.status(400).send('Passwords do not match')
    }
    const user = await User.findById(req.auth._id).exec()

    const hashedOldPassword = await hashPassword(oldPassword)
    console.log(hashedOldPassword, user.password)
    const match = await comparePassword(oldPassword, user.password)
    if (!match) {
      console.log('Wrong old password')
      return res.status(400).send('Wrong old password')
    }
    const hashedNewPassword = await hashPassword(newPassword)
    if (hashedOldPassword === hashedNewPassword) {
      console.log('New password cannot be same as old password')
      return res.status(400).send('New password cannot be same as old password')
    }
    await User.findByIdAndUpdate(req.auth._id, {
      password: hashedNewPassword,
    }).exec()
    res.json({ success: true })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const loginWithFacebook = async (req, res) => {
  {
    const user = await User.findById(req.user._id).select('-password').exec()
    if (user.banned) {
      return res
        .status(403)
        .send('Your are banned.')
        .redirect('http://localhost:3000')
    }
    const token = jwt.sign(
      { _id: req.user._id, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )

    // Encode the user data as a URI component
    const userData = encodeURIComponent(JSON.stringify(user))
    res.cookie('token', token, {
      httpOnly: true,
    })

    // Redirect the user to the frontend callback page with the user data and JWT token as query parameters
    res.redirect(`http://localhost:3000/facebookcallback?&user=${userData}`)
  }
}

export const loginWithGoogle = async (req, res) => {
  {
    const user = await User.findById(req.user._id).select('-password').exec()
    if (user.banned) {
      return res
        .status(403)
        .send('Your are banned.')
        .redirect('http://localhost:3000')
    }
    const token = jwt.sign(
      { _id: req.user._id, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )

    // Encode the user data as a URI component
    const userData = encodeURIComponent(JSON.stringify(user))
    res.cookie('token', token, {
      httpOnly: true,
    })

    // Redirect the user to the frontend callback page with the user data and JWT token as query parameters
    res.redirect(`http://localhost:3000/googlecallback?&user=${userData}`)
  }
}
