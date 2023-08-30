// Helper function to compute total video duration for a course
const computeTotalDuration = async (Course, courseId) => {
  const course = await Course.findById(courseId).exec()
  return course.lessons.reduce((acc, lesson) => acc + lesson.videoDuration, 0)
}

export default computeTotalDuration
