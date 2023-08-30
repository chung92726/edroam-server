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
      minlength: 1,
      maxlength: 80,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    videoDuration: {
      type: Number, // duration in seconds
      default: 0,
    },
    content: {
      type: {},
      // minlength: 200,
    },
    quiz: [{ type: ObjectId, ref: 'Quiz' }],
    video: {},
    free_preview: {
      type: Boolean,
      default: false,
    },
    supplementary_resources: [supplementary_resourcesSchema],
  },
  { timestamps: true }
)
const studentProgressSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  quizzesTaken: {
    type: Number,
    default: 0,
  },
  quizzesPassed: {
    type: Number,
    default: 0,
  },
})
const courseReview = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      // validate: {
      //   validator: Number.isInteger,
      //   message: '{VALUE} is not an integer value',
      // },
      min: 0.5,
      max: 5,
    },
    review: {
      type: String,

      maxlength: 2000,
    },
    instructorFeedback: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

const courseSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 50,
      required: true,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      // minlength: 100,
      maxlength: 300,
      required: true,
    },
    detailDescription: { type: String },
    price: {
      type: Number,
      default: 9.99,
    },
    reviews: [courseReview],
    image: {},
    category: [],
    level: {
      type: String,
      enum: ['All Levels', 'Beginner', 'Intermediate', 'Expert'],
      default: 'All Levels',
    },
    language: {
      type: String,
      enum: ['English', 'Chinese'],
      default: 'English',
    },
    published: {
      type: Boolean,
      default: false,
    },
    totalVideoDuration: {
      type: Number, // total duration in seconds for all lessons combined
      default: 0,
    },
    mainPreview: {
      type: lessonSchema,
    },

    quizProgress: [studentProgressSchema],

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
