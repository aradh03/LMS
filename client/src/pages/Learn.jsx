import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import ProgressBar from "../components/ProgressBar";

export default function Learn() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completed, setCompleted] = useState(new Set());
  const [activeLessonId, setActiveLessonId] = useState("");
  const [percent, setPercent] = useState(0);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const activeLesson = useMemo(
    () => lessons.find((l) => l._id === activeLessonId),
    [lessons, activeLessonId]
  );

  const load = useCallback(async () => {
  setErr("");
  try {
    const c = await api.get(`/api/courses/${courseId}`);
    setCourse(c.data.course);
    setLessons(c.data.lessons || []);
    if ((c.data.lessons || []).length > 0) setActiveLessonId((c.data.lessons || [])[0]._id);
  } catch {
    setErr("Could not load learning page.");
    return;
  }

  try {
    const p = await api.get(`/api/progress/${courseId}`);
    setPercent(p.data.percent || 0);
    setCompleted(new Set(p.data.completedLessons || []));
  } catch {
    // ignore
  }
}, [courseId]);


  useEffect(() => {
  load();
}, [load]);


  const markComplete = async () => {
    if (!activeLessonId) return;
    setMsg("");
    setErr("");

    try {
      const res = await api.post(`/api/progress/${courseId}/complete`, { lessonId: activeLessonId });
      setPercent(res.data.percent || 0);
      setCompleted(new Set(res.data.completedLessons || []));
      setMsg("Lesson marked complete!");
    } catch {
      setErr("Failed to update progress.");
    }
  };

  if (err) return <div className="container"><div className="card error">{err}</div></div>;
  if (!course) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{course.title}</h2>
        <ProgressBar percent={percent} />
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <Link className="btn secondary" to={`/course/${courseId}`}>Back</Link>
          <Link className="btn" to={`/certificate/${courseId}`}>Certificate</Link>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Player</h3>
          {!activeLesson ? (
            <p>No lesson selected.</p>
          ) : (
            <>
              <div className="video-box">
                <video controls src={`http://localhost:5000${activeLesson.videoUrl}`} />
              </div>
              <h4 style={{ marginBottom: 6 }}>{activeLesson.title}</h4>
              <button className="btn" onClick={markComplete} disabled={completed.has(activeLessonId)}>
                {completed.has(activeLessonId) ? "Completed" : "Mark Complete"}
              </button>
              {msg && <div className="success">{msg}</div>}
              {err && <div className="error">{err}</div>}
            </>
          )}
        </div>

        <div className="card">
          <h3>Lessons</h3>
          <div className="lesson-list">
            {lessons.map((l) => (
              <div
                key={l._id}
                className={`lesson-item ${l._id === activeLessonId ? "active" : ""}`}
              >
                <div>
                  <strong>{l.title}</strong>
                  {completed.has(l._id) && <span className="badge">Done</span>}
                </div>
                <button className="btn light" onClick={() => setActiveLessonId(l._id)}>
                  Open
                </button>
              </div>
            ))}
            {lessons.length === 0 && <p>No lessons yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
