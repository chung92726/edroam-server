import Quiz from "../models/quiz";
import StudentResponse from "../models/quizResponse";
import Course from "../models/course";
import User from "../models/user";

export const createQuiz = async (req, res) => {
  try {
    const { title, description, passingRate, course, lesson, coursePassing } =
      req.body;

    const userId = req.auth._id;
    const Or_Course = await Course.findById(course);

    if (!Or_Course) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (Or_Course.instructor.toString() != userId.toString()) {
      return res.status(401).json({ error: "You are not authorized" });
    }

    // Find the lesson within the course
    const Or_Lesson = Or_Course.lessons.find(
      (lessonItem) => lessonItem._id.toString() === lesson
    );

    if (!Or_Lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const quiz = new Quiz({
      title,
      description,
      passingRate,
      courseId: course,
      lessonId: lesson,
      lessonTitle: Or_Lesson.title, // Use the title from the lesson
      courseTitle: Or_Course.name,
      coursePassingQuiz: coursePassing,
      instructorId: userId,
    });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const getQuizzes = async (req, res) => {
  const userId = req.auth._id;
  const { search } = req.query;

  try {
    const searchRegex = new RegExp(search, "i"); // case-insensitive search

    // Search in Quiz model
    const quizzes = await Quiz.find({
      instructorId: userId,
      $or: [
        { title: searchRegex },
        { courseTitle: searchRegex },
        { lessonTitle: searchRegex },
      ],
    });

    res.status(200).json(quizzes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (quiz.instructorId.toString() != req.auth._id.toString()) {
      return res.status(401).json({ error: "You are not authorized" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateQuiz = async (req, res) => {
  const { title, description, passingRate, course, lesson, coursePassing } =
    req.body;
  console.log(req.params.quizId);
  try {
    const quiz_check = await Quiz.findById(req.params.quizId);
    if (!quiz_check) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (quiz_check.instructorId.toString() != req.auth._id.toString()) {
      return res.status(401).json({ error: "You are not authorized" });
    }

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      {
        title,
        description,
        passingRate,
        courseId: course,
        lessonId: lesson,
        coursePassingQuiz: coursePassing,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz_check = await Quiz.findById(req.params.quizId);
    if (!quiz_check) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (quiz_check.instructorId.toString() != req.auth._id.toString()) {
      return res.status(401).json({ error: "You are not authorized" });
    }
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);

    res.status(200).json({ message: "Quiz deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    quiz.questions.push(req.body);
    await quiz.save();

    res.status(201).json({ message: "Question added", question: req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const questionIndex = quiz.questions.findIndex(
      (question) => question._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ error: "Question not found" });
    }

    quiz.questions.splice(questionIndex, 1);
    await quiz.save();

    res.status(200).json({ message: "Question deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateQuestions = async (req, res) => {
  console.log(req.body);
  try {
    const ver_quiz = await Quiz.findById(req.params.quizId);
    if (!ver_quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (ver_quiz.instructorId.toString() != req.auth._id.toString()) {
      return res.status(401).json({ error: "You are not authorized" });
    }

    // Replace the entire questions array with the new array
    ver_quiz.questions = req.body.questions;

    // Save the updated quiz
    await ver_quiz.save();

    res
      .status(200)
      .json({ message: "Questions updated", questions: req.body.questions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const generateRandomQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const questionCount = Math.min(
      quiz.questions.length,
      quiz.reservedQuestions.length
    );
    const randomQuestions = [];

    for (let i = 0; i < questionCount; i++) {
      const randomIndex = Math.floor(
        Math.random() * quiz.reservedQuestions.length
      );
      const selectedQuestion = quiz.reservedQuestions.splice(randomIndex, 1)[0];
      randomQuestions.push(selectedQuestion);
    }

    res.status(200).json(randomQuestions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addReservedQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const question = quiz.questions.id(req.params.questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    quiz.reservedQuestions.push(question);
    await quiz.save();

    res.status(201).json({ message: "Question reserved" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const questionIndex = quiz.questions.findIndex(
      (question) => question._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ error: "Question not found" });
    }

    const answerIndex = quiz.questions[questionIndex].answers.findIndex(
      (answer) => answer._id.toString() === req.params.answerId
    );

    if (answerIndex === -1) {
      return res.status(404).json({ error: "Answer not found" });
    }

    quiz.questions[questionIndex].answers.splice(answerIndex, 1);
    await quiz.save();

    res.status(200).json({ message: "Answer deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addAnswer = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const questionIndex = quiz.questions.findIndex(
      (question) => question._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ error: "Question not found" });
    }

    quiz.questions[questionIndex].answers.push(req.body);
    await quiz.save();

    res.status(201).json({ message: "Answer added", answer: req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    const user = await User.findById(req.auth._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.courses.includes(quiz.courseId)) {
      return res.status(401).json({ error: "You are not authorized" });
    }

    const studentResponse = new StudentResponse({
      quizId: req.params.quizId,
      studentName: user.name,
      studentId: user._id,
      answers: req.body.answers,
    });

    let correctAnswers = 0;
    studentResponse.answers.forEach((answer) => {
      const question = quiz.questions.id(answer.questionId);
      if (question) {
        const correctAnswerIds = question.answers
          .filter((ans) => ans.isCorrect)
          .map((ans) => ans._id.toString());

        const isCorrect =
          answer.selectedAnswers.every((selectedAnswerId) =>
            correctAnswerIds.includes(selectedAnswerId.toString())
          ) && answer.selectedAnswers.length === correctAnswerIds.length;

        if (isCorrect) {
          correctAnswers++;
        }
      }
    });

    studentResponse.score = (correctAnswers / quiz.questions.length) * 100;
    if (studentResponse.score >= quiz.passingScore) {
      studentResponse.pass = true;
    }
    await studentResponse.save();

    res
      .status(201)
      .json({ message: "Quiz submitted", score: studentResponse.score });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const publishQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (quiz.published) {
      return res.status(400).json({ error: "Quiz already published" });
    }
    if (quiz.instructorId.toString() !== req.auth._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Ensure the quiz has at least one question
    if (quiz.questions.length < 1) {
      return res.status(400).json({
        error:
          "Quiz must contain at least one question before it can be published",
      });
    }

    // Update the published field
    quiz.published = true;
    await quiz.save();

    res.status(200).json(quiz);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const unpublishQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    if (!quiz.published) {
      return res.status(400).json({ error: "Quiz already unpublished" });
    }
    if (quiz.instructorId.toString() !== req.auth._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update the published field
    quiz.published = false;
    await quiz.save();

    res.status(200).json(quiz);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getQuizByCourseIdLessonId = async (req, res) => {
  try {
    const quiz = await Quiz.find({
      courseId: req.params.courseId,
      lessonId: req.params.lessonId,
      published: true,
    }).select("-questions.answers.isCorrect");

    if (!quiz) {
      console.log("Quiz not found");
      return res.status(404).json({ error: "Quiz not found" });
    }
    const user = await User.findById(req.auth._id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }
    if (user.courses.includes(req.params.courseId)) {
      return res.status(200).json(quiz);
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const UserGetQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).select(
      "-questions.answers.isCorrect"
    );
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    const user = await User.findById(req.auth._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.courses.includes(quiz.courseId)) {
      return res.status(200).json(quiz);
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const fetchHighestQuizResponse = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    const user = await User.findById(req.auth._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.courses.includes(quiz.courseId)) {
      return res.status(401).json({ error: "You are not authorized" });
    }

    const highestResponse = await StudentResponse.find({
      quizId: req.params.quizId,
      studentId: req.auth._id,
    })
      .sort({ score: -1 })
      .limit(1);

    // console.log(highestResponse);

    // if (highestResponse.length == 0) {
    //   res.status(200).json([{ score: 0 }]);
    //   return;
    // }

    res.status(200).json(highestResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const UserGetQuizReview = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate(
      "courseId",
      "slug _id"
    );
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    const user = await User.findById(req.auth._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.courses.includes(quiz.courseId._id)) {
      return res.status(401).json({ error: "You are not authorized" });
    }

    const highestResponse = await StudentResponse.find({
      quizId: req.params.quizId,
      studentId: req.auth._id,
    })
      .sort({ score: -1 })
      .limit(1);

    if (!highestResponse) {
      return res.status(404).json({ error: "You haven't took the quiz" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
