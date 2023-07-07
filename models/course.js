import mongoose from 'mongoose'
const { Schema } = mongoose
const { ObjectId } = mongoose.Schema

const supplementary_resourcesSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true,
    },
    file: {},
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    file_type: {
      type: String,
      enum: [
        'zip',
        'pdf',
        'doc',
        'txt',
        'ppt',
        'picture',
        'video',
        'audio',
        'other',
      ],
      default: 'other',
    },
  },
  { timestamps: true }
)

const lessonSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    content: {
      type: {},
      minlength: 200,
    },
    video: {},
    free_preview: {
      type: Boolean,
      default: false,
    },
    supplementary_resources: [supplementary_resourcesSchema],
  },
  { timestamps: true }
)

const courseSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: {},
      minlength: 200,
      required: true,
    },
    price: {
      type: Number,
      default: 9.99,
    },
    image: {},
    category: String,
    published: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: true,
    },
    instructor: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    lessons: [lessonSchema],
    TotalRevenue: {
      type: Number,
      default: 0,
    },
    EnrolledUser: [{ type: ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

export default mongoose.model('Course', courseSchema)
