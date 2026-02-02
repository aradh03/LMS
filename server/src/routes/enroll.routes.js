const router = require("express").Router();
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const Course = require("../models/Course");
const { requireAuth } = require("../middleware/auth");

router.post("/:courseId", requireAuth, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course || !course.isPublished) return res.status(404).json({ message: "Course not found" });

  await Enrollment.updateOne(
    { studentId: req.user._id, courseId: course._id },
    { $setOnInsert: { studentId: req.user._id, courseId: course._id } },
    { upsert: true }
  );

  await Progress.updateOne(
    { studentId: req.user._id, courseId: course._id },
    { $setOnInsert: { studentId: req.user._id, courseId: course._id, completedLessons: [] } },
    { upsert: true }
  );

  res.json({ ok: true });
});

router.get("/my/list", requireAuth, async (req, res) => {
  // not used by frontend directly (we use /api/my-courses) but kept for reference
  const enrolls = await Enrollment.find({ studentId: req.user._id });
  res.json({ enrolls });
});

module.exports = router;
