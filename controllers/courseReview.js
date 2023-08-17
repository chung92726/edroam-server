import Course from '../models/course'
import User from '../models/user'

// Create a course review
export const createCourseReview = async (req, res) => {
  try {
    const { courseId } = req.params
    const { rating, review } = req.body

    const userId = req.auth._id
    const user = await User.findById(userId).exec()

    if (!user.courses.includes(courseId)) {
      return res
        .status(400)
        .json({ message: 'You have not enrolled in this course.' })
    }

    const course = await Course.findById(courseId)
    const existingReview = course.reviews.find(
      (r) => r.userId.toString() === userId
    )

    if (existingReview) {
      return res
        .status(400)
        .json({ message: 'You have already reviewed this course.' })
    }

    // Calculate new average rating
    const newTotalReviews = course.numberOfReviews + 1
    const newAverageRating =
      (course.averageRating * course.numberOfReviews + rating) / newTotalReviews

    const updatedCourse = await Course.findByIdAndUpdate(courseId, {
      $push: {
        reviews: {
          userId,
          rating,
          review,
        },
      },
      $set: {
        numberOfReviews: newTotalReviews,
        averageRating: newAverageRating,
      },
    })

    if (updatedCourse) {
      res.status(200).json({ message: 'Review added successfully.' })
    } else {
      res.status(400).json({ message: 'Failed to add review.' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get course reviews
export const getCourseReviews = async (req, res) => {
  const { courseId } = req.params
  const { rating, search, limit = 20, page = 1 } = req.query

  const skip = (parseInt(page) - 1) * parseInt(limit)

  try {
    let course = await Course.findById(courseId)
      .populate('reviews.userId', 'name picture')
      .exec()

    // If a rating filter is provided, filter reviews by that rating
    if (rating) {
      course.reviews = course.reviews.filter(
        (review) => Math.floor(review.rating) === Number(rating)
      )
    }

    // If a search query is provided, filter reviews to those containing the search query
    if (search) {
      const regex = new RegExp(search, 'i')
      course.reviews = course.reviews.filter((review) =>
        regex.test(review.review)
      )
    }

    const paginatedReviews = course.reviews.slice(skip, skip + parseInt(limit))

    res.status(200).json({
      reviews: paginatedReviews,
      totalCount: course.reviews.length,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Delete a course review
export const deleteCourseReview = async (req, res) => {
  const { courseId, reviewId } = req.params
  const userId = req.auth._id

  try {
    const course = await Course.findById(courseId)
    const review = course.reviews.id(reviewId)

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' })
    }
    if (review.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own reviews.' })
    }

    review.remove()
    await course.save()
    res.status(200).json({ message: 'Review deleted.' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Update a course review
export const updateCourseReview = async (req, res) => {
  const { courseId, reviewId } = req.params
  const { rating, review } = req.body
  const userId = req.auth._id

  try {
    const course = await Course.findById(courseId)
    const reviewToUpdate = course.reviews.id(reviewId)

    if (!reviewToUpdate) {
      return res.status(404).json({ message: 'Review not found.' })
    }
    if (reviewToUpdate.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'You can only edit your own reviews.' })
    }

    if (rating) reviewToUpdate.rating = rating
    if (review) reviewToUpdate.review = review

    await course.save()

    res.status(200).json({ message: 'Review updated.' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error.' })
  }
}

export const getRatingPercentages = async (req, res) => {
  const { courseId } = req.params

  try {
    const course = await Course.findById(courseId)
    const totalReviews = course.reviews.length
    const ratingCounts = course.reviews.reduce((acc, curr) => {
      acc[curr.rating] = (acc[curr.rating] || 0) + 1
      return acc
    }, {})
    const ratingPercentages = {}
    for (let rating in ratingCounts) {
      ratingPercentages[rating] = (ratingCounts[rating] / totalReviews) * 100
    }

    res.status(200).json(ratingPercentages)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get average score and total number of reviews for a course
export const getCourseReviewStats = async (req, res) => {
  const { courseId } = req.params

  try {
    const course = await Course.findById(courseId)
    const totalReviews = course.reviews.length
    const avgRating =
      course.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews

    // Calculate rating distribution
    const ratingDistribution = course.reviews.reduce((acc, curr) => {
      let rating = Math.floor(curr.rating) // round down decimal ratings
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    }, {})

    // Initialize all ratings to 0
    const allRatings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const finalRatingDistribution = { ...allRatings, ...ratingDistribution }

    // Calculate rating percentages
    const ratingPercentages = {}
    for (const rating in finalRatingDistribution) {
      ratingPercentages[rating] =
        (finalRatingDistribution[rating] / totalReviews) * 100
    }

    res.status(200).json({
      avgRating,
      totalReviews,
      ratingDistribution: finalRatingDistribution,
      ratingPercentages,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error.' })
  }
}
