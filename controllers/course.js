import AWS from 'aws-sdk'
import ShortUniqueId from 'short-unique-id'
import Course from '../models/course'
import slugify from 'slugify'
import fs from 'fs'
import User from '../models/user'
import Completed from '../models/completed'
import Enrolled from '../models/enrolled'
import getSignedFileUrl from '../utils/signedUrl'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

const stripe = require('stripe')(process.env.STRIPE_SECRET)

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
}
const client = new S3Client({})

const S3 = new AWS.S3(awsConfig)

export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body
    if (!image) return res.status(400).send('No image')
    const uid = new ShortUniqueId({ length: 18 })

    //prepare the image for upload
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    )
    const type = image.split(';')[0].split('/')[1]
    const params = {
      Bucket: 'devroad-bucket',
      Key: `${uid()}.${type}`,
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/${type}`,
    }

    //upload to s3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err)
        return res.sendStatus(400)
      }
      console.log('AWS UPLOAD RES DATA', data)
      res.send(data)
    })
  } catch {
    console.log(err)
  }
}

export const removeImage = async (req, res) => {
  try {
    const { image } = req.body
    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    }

    //send remove request to S3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err)
        res.sendStatus(400)
      }
      res.send({ ok: true })
    })
  } catch (err) {
    console.log(err)
    res.sendStatus(400)
  }
}

export const create = async (req, res) => {
  try {
    const alreadyExist = await Course.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    })
    if (alreadyExist) return res.status(400).send('Title is taken')
    const course = await new Course({
      slug: slugify(req.body.name),
      instructor: req.auth._id,
      ...req.body,
    }).save()

    res.json(course)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const read = async (req, res) => {
  console.log('course')
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', '_id name picture biography')
      .exec()
    res.json(course)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const uploadVideo = async (req, res) => {
  try {
    if (req.auth._id !== req.params.instructorId) {
      return res.status(400).send('Unauthorized')
    }
    const { video } = req.files
    if (!video) return res.status(400).send('No video')
    const uid = new ShortUniqueId({ length: 18 })
    const params = {
      Bucket: 'devroad-bucket',
      Key: `${uid()}.${video.type.split('/')[1]}`, // type is video/mp4
      Body: fs.readFileSync(video.path),
      ACL: 'public-read',
      ContentType: video.type,
    }
    // upload to S3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err)
        return res.sendStatus(400)
      }
      console.log('AWS UPLOAD RES DATA', data)
      res.send(data)
    })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const removeVideo = async (req, res) => {
  if (req.auth._id !== req.params.instructorId) {
    return res.status(400).send('Unauthorized')
  }
  try {
    const video = req.body

    const params = {
      Bucket: video.Bucket,
      Key: video.Key,
    }
    // upload to S3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err)
        res.sendStatus(400)
      }
      res.send({ ok: true })
    })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const addLesson = async (req, res) => {
  try {
    const { slug, instructorId } = req.params
    const { title, content, video, free_preview, supplementary_resources } =
      req.body
    if (req.auth._id !== instructorId) {
      return res.status(400).send('Unauthorized')
    }
    const updated = await Course.findOneAndUpdate(
      { slug },
      {
        $push: {
          lessons: {
            title,
            content,
            video,
            free_preview,
            slug: slugify(title),
            supplementary_resources,
          },
        },
      },
      { new: true }
    )
      .populate('instructor', '_id name')
      .exec()
    res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Add Lesson Failed')
  }
}

export const update = async (req, res) => {
  try {
    const { slug } = req.params
    const course = await Course.findOne({ slug }).exec()
    console.log(req.auth._id, course.instructor._id.toString())
    if (req.auth._id !== course.instructor._id.toString()) {
      return res.status(400).send('Unauthorized')
    }
    const updated = await Course.findOneAndUpdate({ slug }, req.body, {
      new: true,
    })
      .populate('instructor', '_id name')
      .exec()
    res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(400).send(err.message)
  }
}

export const removeLesson = async (req, res) => {
  try {
    const { slug, lessonId } = req.params
    const course = await Course.findOne({ slug }).exec()
    console.log(req.auth._id, course)
    if (req.auth._id !== course.instructor._id.toString()) {
      return res.status(400).send('Unauthorized')
    }
    const courseToUpdate = await Course.findByIdAndUpdate(course._id, {
      $pull: { lessons: { _id: lessonId } },
    }).exec()
    res.json({ ok: true })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Delete Lesson Failed')
  }
}

export const updateLesson = async (req, res) => {
  try {
    const { slug, instructorId } = req.params
    const course = await Course.findOne({ slug }).select('instructor').exec()
    if (req.auth._id !== course.instructor._id.toString()) {
      return res.status(400).send('Unauthorized')
    }
    const {
      title,
      content,
      video,
      free_preview,
      _id,
      supplementary_resources,
    } = req.body
    const updated = await Course.updateOne(
      { 'lessons._id': _id },
      {
        $set: {
          'lessons.$.title': title,
          'lessons.$.content': content,
          'lessons.$.video': video,
          'lessons.$.free_preview': free_preview,
          'lessons.$.supplementary_resources': supplementary_resources,
        },
      },
      { new: true }
    )
      .populate('instructor', '_id name')
      .exec()
    res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Update Lesson Failed')
  }
}

export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    const course = await Course.findById(courseId).select('instructor').exec()

    if (req.auth._id !== course.instructor._id.toString()) {
      return res.status(400).send('Unauthorized')
    }
    const updated = await Course.findByIdAndUpdate(
      { _id: courseId },
      { published: true },
      { new: true }
    ).exec()
    res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Publish course failed')
  }
}

export const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId).select('instructor').exec()
    if (req.auth._id !== course.instructor._id.toString()) {
      return res.status(400).send('Unauthorized')
    }
    const updated = await Course.findByIdAndUpdate(
      { _id: courseId },
      { published: false },
      { new: true }
    ).exec()
    res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Unpublish course failed')
  }
}

export const courses = async (req, res) => {
  const all = await Course.find({ published: true })
    .populate('instructor', '_id name')
    .exec()
  res.json(all)
}

export const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params
    console.log(courseId)
    // find course for the currently logged in user
    const user = await User.findById(req.auth._id).exec()
    // check if course id is found in user courses array
    let ids = []
    let length = user.courses ? user.courses.length : 0
    for (let i = 0; i < length; i++) {
      ids.push(user.courses[i].toString())
    }
    res.json({
      status: ids.includes(courseId),
      course: await Course.findById(courseId).exec(),
    })
  } catch (err) {
    console.log(err)
  }
}

export const freeEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params
    // check if the course is paid or not
    const course = await Course.findById(courseId).exec()
    if (course.paid)
      return res.status(400).send('Paid course cannot be enrolled for free')
    // find course for the currently logged in user
    const result = await User.findByIdAndUpdate(
      req.auth._id,
      {
        $addToSet: { courses: courseId }, // addtoset to make sure no duplicates
      },
      { new: true }
    ).exec()
    const enroll = await new Enrolled({
      user: req.auth._id,
      course: courseId,
      instructor: course.instructor,
      price: course.price,
    }).save()
    const updated = await Course.findByIdAndUpdate(courseId, {
      $addToSet: { EnrolledUser: req.auth._id },
    })
    res.json({
      message: 'Congratulations! You have successfully enrolled',
      course: course,
    })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Enrollment create failed')
  }
}

export const paidEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId).populate('instructor').exec()
    if (!course.paid) {
      return res.status(400).send('Free course does not require payment')
    }
    // application fee 30% for platform and 70% for instructor
    const fee = (course.price * 30) / 100
    // create session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // purchas details
      mode: 'payment',
      line_items: [
        {
          price_data: {
            unit_amount: Math.round(course.price.toFixed(2) * 100),
            currency: 'usd',
            product_data: {
              name: course.name,
            },
          },

          quantity: 1,
        },
      ],
      // charge buyer and transfer remaining balance to seller
      payment_intent_data: {
        application_fee_amount: Math.round(fee.toFixed(2) * 100),
        transfer_data: {
          destination: course.instructor.stripe_account_id,
        },
      },
      // redirect url after payment
      success_url: `${process.env.STRIPE_SUCCESS_URL}/${course._id}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    })
    console.log('session', session)
    // save user's the stripe session
    await User.findByIdAndUpdate(req.auth._id, {
      stripeSession: session,
    }).exec()
    // send session id as response to frontend
    res.send(session.id)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Enrollment create failed')
  }
  // check if the course is paid or not
}

export const stripeSuccess = async (req, res) => {
  try {
    // find course
    const course = await Course.findById(req.params.courseId).exec()
    // get user from db to get stripe session id
    const user = await User.findById(req.auth._id).exec()
    // if no stripe session return
    if (!user.stripeSession.id) return res.sendStatus(400)
    // retrieve stripe session
    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    )
    // if session payment status is paid, push course to user's courses array and remove stripe session
    if (session.payment_status === 'paid') {
      await User.findByIdAndUpdate(req.auth._id, {
        $addToSet: { courses: course._id },
        $set: { stripeSession: {} },
      }).exec()
      const enroll = await new Enrolled({
        user: req.auth._id,
        course: course._id,
        instructor: course.instructor,
        price: course.price,
      }).save()
      const updated = await Course.findByIdAndUpdate(course._id, {
        $addToSet: { EnrolledUser: req.auth._id },
        // add TotalRevenue
        $inc: { TotalRevenue: course.price },
      })
    }
    res.json({ success: true, course: course })
  } catch (err) {
    console.log(err)
    return res.json({ success: false })
  }
}

export const userCourses = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id).exec()
    const courses = await Course.find({ _id: { $in: user.courses } })
      .populate('instructor', '_id name')
      .exec()
    res.json(courses)
  } catch (err) {
    console.log(err)
    return res.status(400).send('courses fetch failed')
  }
}

export const markCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body
    // find if user with that course is already created
    const existing = await Completed.findOne({
      user: req.auth._id,
      course: courseId,
    }).exec()

    if (existing) {
      // update
      const updated = await Completed.findOneAndUpdate(
        {
          user: req.auth._id,
          course: courseId,
        },
        {
          $addToSet: { lessons: lessonId },
        }
      ).exec()
      res.json({ ok: true })
    } else {
      // create
      const created = await new Completed({
        user: req.auth._id,
        course: courseId,
        lessons: lessonId,
      }).save()
      res.json({ ok: true })
    }
  } catch (err) {
    console.log(err)
    return res.status(400).send('Mark completed failed')
  }
}

export const listCompleted = async (req, res) => {
  try {
    const list = await Completed.findOne({
      user: req.auth._id,
      course: req.body.courseId,
    }).exec()

    list ? res.json(list.lessons) : res.json([])
  } catch (err) {
    console.log(err)
    return res.status(400).send('List completed failed')
  }
}

export const markInCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body
    // find if user with that course is already created
    const existing = await Completed.findOne({
      user: req.auth._id,
      course: courseId,
    }).exec()

    if (existing) {
      // update
      const updated = await Completed.findOneAndUpdate(
        {
          user: req.auth._id,
          course: courseId,
        },
        {
          $pull: { lessons: lessonId },
        }
      ).exec()
      res.json({ ok: true })
    }
  } catch (err) {
    console.log(err)
    return res.status(400).send('Mark incompleted failed')
  }
}

export const studentCount = async (req, res) => {
  try {
    const users = await User.find({ courses: req.body.courseId })
      .select('_id')
      .exec()
    res.json(users)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Student count failed')
  }
}

export const getHistory = async (req, res) => {
  try {
    const history = await Enrolled.find({ user: req.auth._id })
      .populate('course', '_id name')
      .populate('instructor', '_id name picture')
      .exec()
    console.log(history)
    res.json(history)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Get history failed')
  }
}

export const getSignedUrl = async (req, res) => {
  try {
    console.log('start')
    const { filename } = req.body
    console.log(filename)
    const signedUrl = await getSignedFileUrl(filename)
    console.log(signedUrl)

    res.json(signedUrl)
  } catch (err) {
    console.log(err)
    return res.status(400).send('Get signed url failed')
  }
}

export const uploadSupplementary = async (req, res) => {
  try {
    if (req.auth._id !== req.params.instructorId) {
      return res.status(400).send('Unauthorized')
    }
    const { supplementary } = req.files
    console.log(supplementary)

    if (!supplementary) return res.status(400).send('No video')
    const uid = new ShortUniqueId({ length: 18 })
    const params = {
      Bucket: 'devroad-bucket',
      Key: `${uid()}.${supplementary.type.split('/')[1]}`, // type is video/mp4
      Body: fs.readFileSync(supplementary.path),
      ACL: 'public-read',
      ContentType: supplementary.type,
    }
    // upload to S3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err)
        return res.sendStatus(400)
      }
      console.log('AWS UPLOAD RES DATA', data)
      res.send(data)
    })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const removeSupplementary = async (req, res) => {
  try {
    if (req.auth._id !== req.params.instructorId) {
      return res.status(400).send('Unauthorized')
    }
    const { Bucket, Key } = req.body
    // upload to S3
    S3.deleteObject({ Bucket, Key }, (err, data) => {
      if (err) {
        console.log(err)
        return res.sendStatus(400)
      }
      console.log('AWS DELETE RES DATA', data)
      res.send({ ok: true })
    })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const removeupdateSupplementary = async (req, res) => {
  try {
    const { instructorId, slug, lessonId } = req.params
    if (req.auth._id !== instructorId) {
      return res.status(400).send('Unauthorized')
    }
    const { Bucket, Key } = req.body
    // upload to S3
    S3.deleteObject({ Bucket, Key }, (err, data) => {
      if (err) {
        console.log(err)
        return res.sendStatus(400)
      }
      console.log('AWS DELETE RES DATA', data)
    })
    // remove file from db
    const updated = await Course.updateOne(
      { 'lessons._id': lessonId },
      {
        // pull the supplementaryresourse from the lesson
        $pull: { 'lessons.$.supplementaryResources': { Key } },
      },
      { new: true }
    )
      .populate('instructor', '_id name')
      .exec()

    res.send({ ok: true })
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.')
  }
}

export const getS3File = async (req, res) => {
  try {
    const { fileId } = req.params
    const client = new S3Client({
      region: 'ap-northeast-1',
      // credentials: {
      //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      // },
    })
    console.log(fileId)
    const params = {
      Bucket: 'devroad-bucket',
      Key: fileId,
    }
    const command = new GetObjectCommand(params)
    const data = await client.send(command)

    data.Body.pipe(res)
  } catch (err) {
    console.log(err)
  }
}
