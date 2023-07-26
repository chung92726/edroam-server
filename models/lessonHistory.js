import mongoose from 'mongoose'

const lessonHistory = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    videoId: { type: String, default: '' },
    lessonIndex: { type: Number, default: 0 },
    timestamp: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('LessonHistory', lessonHistory)
