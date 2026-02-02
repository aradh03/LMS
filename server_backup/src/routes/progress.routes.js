const router = require("express").Router();
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const Lesson = require("../models/Lesson");
const { requireAuth } = require("../middleware/auth");

function calcPercent(completedCount, total) {
  if (!total) return 0;
  const raw = (completedCount / total) * 100;
  return Math.round(raw);
}

router.get("/:courseId", requireAuth, async (req, res) => {
  const enrolled = await Enrollment.findOne({ studentId: req.user._id, courseId: req.params.courseId });
  if (!enrolled) {
    return res.json({ enrolled: false, percent: 0, completedLessons: [] });
  }

  const progress = await Progress.findOne({ studentId: req.user._id, courseId: req.params.courseId });
  const totalLessons = await Lesson.countDocuments({ courseId: req.params.courseId });

  const completed = progress?.completedLessons || [];
  const percent = calcPercent(completed.length, totalLessons);

  return res.json({
    enrolled: true,
    percent,
    completedLessons: completed
  });
});

router.post("/:courseId/complete", requireAuth, async (req, res) => {
  const { lessonId } = req.body || {};
  if (!lessonId) return res.status(400).json({ message: "lessonId required" });

  // must be enrolled
  const enrolled = await Enrollment.findOne({ studentId: req.user._id, courseId: req.params.courseId });
  if (!enrolled) return res.status(403).json({ message: "Not enrolled" });

  const progress = await Progress.findOneAndUpdate(
    { studentId: req.user._id, courseId: req.params.courseId },
    { $addToSet: { completedLessons: lessonId } },
    { new: true, upsert: true }
  );

  const totalLessons = await Lesson.countDocuments({ courseId: req.params.courseId });
  const percent = calcPercent(progress.completedLessons.length, totalLessons);

  res.json({ percent, completedLessons: progress.completedLessons });
});

module.exports = router;
