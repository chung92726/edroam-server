import LessonHistory from '../models/lessonHistory.js'

export const saveProgress = async (req, res) => {
  const { courseId, lessonId, videoId, lessonIndex, timestamp } = req.body
  const userId = req.auth._id
  try {
    let lessonHistory = await LessonHistory.findOne({ userId, courseId })

    if (lessonHistory) {
      lessonHistory.lessonId = lessonId
      lessonHistory.lessonIndex = lessonIndex
      lessonHistory.videoId = videoId
      lessonHistory.timestamp = timestamp
    } else {
      lessonHistory = new LessonHistory({
        userId,
        courseId,
        lessonId,
        lessonIndex,
        videoId,
        timestamp,
      })
    }

    await lessonHistory.save()

    res.status(200).json({ message: 'Progress saved.' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error.' })
  }
}

export const getProgress = async (req, res) => {
  const { courseId } = req.params
  const userId = req.auth._id
  try {
    const lessonHistory = await LessonHistory.findOne({
      userId,
      courseId,
    })

    res.status(200).json({
      lessonId: lessonHistory ? lessonHistory.lessonId : null,
      videoId: lessonHistory ? lessonHistory.videoId : null,
      timestamp: lessonHistory ? lessonHistory.timestamp : 0,
      lessonIndex: lessonHistory ? lessonHistory.lessonIndex : 0,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
}
