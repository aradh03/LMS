const router = require("express").Router();
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const { requireAuth, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res) => {
  const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
  res.json({ courses });
});

router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course || !course.isPublished) return res.status(404).json({ message: "Not found" });

  const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1, createdAt: 1 });
  res.json({ course, lessons });
});

router.post("/:id/lessons", requireAuth, adminOnly, async (req, res) => {
  const { title, videoUrl, order } = req.body || {};
  if (!title || !videoUrl) return res.status(400).json({ message: "title and videoUrl required" });

  const lesson = await Lesson.create({
    courseId: req.params.id,
    title,
    videoUrl,
    order: Number(order) || 0
  });

  res.json({ lesson });
});


// admin create
router.post("/", requireAuth, adminOnly, async (req, res) => {
  const { title, description } = req.body || {};
  if (!title) return res.status(400).json({ message: "Title required" });

  const course = await Course.create({
    title,
    description: description || "",
    createdBy: req.user._id,
    isPublished: true
  });

  res.json({ course });
});

// admin update
router.put("/:id", requireAuth, adminOnly, async (req, res) => {
  const { title, description, isPublished } = req.body || {};
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Not found" });

  if (title !== undefined) course.title = title;
  if (description !== undefined) course.description = description;
  if (isPublished !== undefined) course.isPublished = !!isPublished;

  await course.save();
  res.json({ course });
});

module.exports = router;
