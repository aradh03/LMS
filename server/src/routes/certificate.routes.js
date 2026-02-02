const router = require("express").Router();
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const Lesson = require("../models/Lesson");
const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const { requireAuth } = require("../middleware/auth");

function makeCertificateId() {
  return "CERT-" + Math.random().toString(36).slice(2, 8).toUpperCase() + "-" + Date.now().toString().slice(-6);
}

router.get("/:courseId", requireAuth, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const enrolled = await Enrollment.findOne({ studentId: req.user._id, courseId: course._id });
  if (!enrolled) {
    return res.json({ eligible: false });
  }

  const totalLessons = await Lesson.countDocuments({ courseId: course._id });
  const progress = await Progress.findOne({ studentId: req.user._id, courseId: course._id });
  const completedCount = progress?.completedLessons?.length || 0;

  const eligible = totalLessons > 0 && completedCount === totalLessons;

  if (!eligible) {
    return res.json({ eligible: false });
  }

  // create/read certificate record
  let cert = await Certificate.findOne({ studentId: req.user._id, courseId: course._id });
  if (!cert) {
    cert = await Certificate.create({
      studentId: req.user._id,
      courseId: course._id,
      certificateId: makeCertificateId(),
      issuedAt: new Date()
    });
  }

  return res.json({
    eligible: true,
    certificateId: cert.certificateId,
    issuedAt: cert.issuedAt,
    studentName: req.user.name,
    courseTitle: course.title
  });
});

module.exports = router;
