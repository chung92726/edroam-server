import User from "../models/user"
import AWS from "aws-sdk"
import { uploadImage, removeImage } from "./course.js"

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
      !picture ||
      !name ||
      !website ||
      !biography ||
      !gender ||
      !ageRange ||
      !phoneNumber ||
      !courseDetails ||
      !teachingExperience
    ) {
      return res.status(400).send("Some fields are missing")
    }

    const updated = await User.findByIdAndUpdate(
      req.auth._id,
      {
        name,
        website,
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
      .select("-password")
      .exec()
    // console.log("updated: " + updated);

    return res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(400).send("Error. Try again.")
  }
}

export const update = async (req, res) => {
  try {
    // console.log(req.body);
    const {
      name,
      website,
      biography,
      picture,
      gender,
      ageRange,
      phoneNumber,
      courseDetails,
      teachingExperience,
    } = req.body

    //validation
    if (!name) return res.status(400).send("Name is required")

    const updated = await User.findByIdAndUpdate(
      req.auth._id,
      {
        name,
        website,
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
      .select("-password")
      .exec()
    // console.log("updated: " + updated);

    return res.json(updated)
  } catch (err) {
    console.log(err)
    return res.status(400).send("Error. Try again.")
  }
}
