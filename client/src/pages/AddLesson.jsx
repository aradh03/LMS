import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function AddLesson() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [videoFile, setVideoFile] = useState(null);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
  setErr("");
  const res = await api.get(`/api/courses/${courseId}`);
  setCourse(res.data.course);
  setLessons(res.data.lessons || []);
  setOrder((res.data.lessons || []).length + 1);
}, [courseId]);


 useEffect(() => {
  load().catch(() => setErr("Failed to load course."));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [courseId]);



  const submit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");

    if (!title.trim()) return setErr("Lesson title is required.");
    if (!videoFile) return setErr("Please choose a video file.");

    try {
      setUploading(true);

      // 1) Upload video
      const fd = new FormData();
      fd.append("video", videoFile);

      const up = await api.post("/api/upload/video", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const videoUrl = up.data.videoUrl;

      // 2) Create lesson
      await api.post(`/api/courses/${courseId}/lessons`, {
        title,
        order: Number(order),
        videoUrl
      });

      setMsg("Lesson added!");
      setTitle("");
      setVideoFile(null);
      await load();
    } catch {
      setErr("Failed to add lesson. Check backend route and admin login.");
    } finally {
      setUploading(false);
    }
  };

  if (err && !course) return <div className="container"><div className="card error">{err}</div></div>;
  if (!course) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Add Lessons</h2>
        <p><strong>Course:</strong> {course.title}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn light" to="/admin/dashboard">Back</Link>
          <Link className="btn secondary" to={`/course/${courseId}`}>View Course</Link>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Add New Lesson</h3>
          <form onSubmit={submit}>
            <label><strong>Lesson Title</strong></label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />

            <label><strong>Order</strong></label>
            <input className="input" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />

            <label><strong>Video File</strong></label>
            <input className="input" type="file" accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />

            <button className="btn" type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload & Add Lesson"}
            </button>
          </form>

          {msg && <div className="success">{msg}</div>}
          {err && <div className="error">{err}</div>}
        </div>

        <div className="card">
          <h3>Existing Lessons</h3>
          {lessons.length === 0 ? <p>No lessons yet.</p> : (
            <ol>
              {lessons.map((l) => <li key={l._id}>{l.title}</li>)}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
