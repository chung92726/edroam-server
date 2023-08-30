import User from '../models/user'
import Course from '../models/course'
import AWS from 'aws-sdk'
import { uploadImage, removeImage } from './course.js'

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
}

const SES = new AWS.SES(awsConfig)

export const instructorUpdated = async (req, res) => {
  try {
    // console.log(req.body);
    const {
      name,
      website,
      youtube,
      facebook,
      instagram,
      twitter,
      wechat,
      tiktok,
      biography,
      picture,
      gender,
      ageRange,
      phoneNumber,
      courseDetails,
      teachingExperience,
    } = req.body

    //validation
    if (
      // !picture ||
      !name ||
      // !website ||
      !biography ||
      // !gender ||
      // !ageRange ||
      !phoneNumber ||
      !biography ||
      !courseDetails ||
      !teachingExperience
    ) {
      return res.status(400).send('Some fields are missing')
    }

    const updated = await User.findByIdAndUpdate(
      req.auth._id,
      {
        name,
        website,
        youtube,
        facebook,
        instagram,
        twitter,
        wechat,
        tiktok,
        biography,
        picture,
        gender,
        ageRange,
        phoneNumber,
        courseDetails,
        teachingExperience,
      },
      { new: true }
    )
      .select('-password')
      .exec()
    // console.log("updated: " + updated);

    return res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const update = async (req, res) => {
  try {
    // console.log(req.body);
    const {
      name,
      website,
      youtube,
      facebook,
      instagram,
      twitter,
      wechat,
      tiktok,
      biography,
      picture,
      gender,
      ageRange,
      phoneNumber,
      courseDetails,
      teachingExperience,
    } = req.body

    //validation
    if (!name) return res.status(400).send('Name is required')

    const updated = await User.findByIdAndUpdate(
      req.auth._id,
      {
        name,
        website,
        youtube,
        facebook,
        instagram,
        twitter,
        wechat,
        tiktok,
        biography,
        picture,
        gender,
        ageRange,
        phoneNumber,
        courseDetails,
        teachingExperience,
      },
      { new: true }
    )
      .select('-password')
      .exec()
    // console.log("updated: " + updated);

    return res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const getUserInfo = async (req, res) => {
  try {
    let courses = await Course.find({
      instructor: req.params.userId,
      published: true,
    })
      .sort({ createdAt: -1 })
      .select(
        '-lessons -EnrolledUser -TotalRevenue -quizNumber -quizProgress -detailDescription'
      )
      .populate('instructor', '-_id name')
      .exec()

    let user = await User.findById(req.params.userId)
      .select(
        '-_id role name email picture biography website youtube facebook instagram twitter wechat tiktok'
      )
      .exec()

    // let user = userDocument.toObject() // Convert the Mongoose document to a plain JS object
    // user.social = [{ type: 'website', link: user.website }]
    // delete user.website
    res.json({ user, courses })
  } catch (err) {
    console.log(err)
    res.status(400).send('Get member failed. Try again.')
  }
}
