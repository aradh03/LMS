require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const { requireAuth } = require("./middleware/auth");

const Enrollment = require("./models/Enrollment");
const Course = require("./models/Course");
const Lesson = require("./models/Lesson");
const Progress = require("./models/Progress");

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const uploadRoutes = require("./routes/upload.routes");
const enrollRoutes = require("./routes/enroll.routes");
const progressRoutes = require("./routes/progress.routes");
const certificateRoutes = require("./routes/certificate.routes");

const app = express();

app.use(cors());
app.use(express.json());

// uploaded videos
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/enroll", enrollRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/certificate", certificateRoutes);

// endpoint your frontend expects:
app.get("/api/my-courses", requireAuth, async (req, res) => {
  // find enrollments
  const enrolls = await Enrollment.find({ studentId: req.user._id }).sort({ createdAt: -1 });
  const courseIds = enrolls.map((e) => e.courseId);

  const courses = await Course.find({ _id: { $in: courseIds } });
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));

  // compute % for each course
  const items = [];
  for (const enr of enrolls) {
    const course = courseMap.get(String(enr.courseId));
    if (!course) continue;

    const totalLessons = await Lesson.countDocuments({ courseId: course._id });
    const progress = await Progress.findOne({ studentId: req.user._id, courseId: course._id });
    const completedCount = progress?.completedLessons?.length || 0;

    const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
    items.push({ course, percent });
  }

  res.json({ items });
});

// health
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });
