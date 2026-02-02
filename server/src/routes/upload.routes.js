const router = require("express").Router();
const path = require("path");
const multer = require("multer");
const { requireAuth, adminOnly } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads", "videos")),
  filename: (req, file, cb) => {
    const safe = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safe);
  }
});

function fileFilter(req, file, cb) {
  // allow basic video types
  const ok = file.mimetype.startsWith("video/");
  cb(ok ? null : new Error("Only video files allowed"), ok);
}

const upload = multer({ storage, fileFilter });

router.post("/video", requireAuth, adminOnly, upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const videoUrl = `/uploads/videos/${req.file.filename}`;
  res.json({ videoUrl });
});

module.exports = router;
