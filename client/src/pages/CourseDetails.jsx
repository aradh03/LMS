import React, { useContext, useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import ProgressBar from "../components/ProgressBar";

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
  setErr("");
  try {
    const c = await api.get(`/api/courses/${id}`);
    setCourse(c.data.course);
    setLessons(c.data.lessons || []);
  } catch {
    setErr("Could not load course.");
  }

  if (user) {
    try {
      const p = await api.get(`/api/progress/${id}`);
      setProgress(p.data.percent || 0);
      setEnrolled(!!p.data.enrolled);
    } catch {
      // ignore
    }
  }
}, [id, user]);


 useEffect(() => {
  load();
}, [load]);


  const enroll = async () => {
    setMsg("");
    setErr("");
    try {
      await api.post(`/api/enroll/${id}`);
      setMsg("Enrolled successfully!");
      setEnrolled(true);
    } catch {
      setErr("Enrollment failed. Please login first.");
    }
  };

  if (err) return <div className="container"><div className="card error">{err}</div></div>;
  if (!course) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{course.title}</h2>
        <p>{course.description}</p>

        {user ? (
          <>
            {!enrolled ? (
              <button className="btn" onClick={enroll}>Enroll</button>
            ) : (
              <Link className="btn" to={`/learn/${id}`}>Start Learning</Link>
            )}
            <ProgressBar percent={progress} />
          </>
        ) : (
          <div className="card">
            Please <Link to="/login">login</Link> to enroll.
          </div>
        )}

        {msg && <div className="success">{msg}</div>}
      </div>

      <div className="card">
        <h3>Lessons</h3>
        {lessons.length === 0 ? <p>No lessons yet.</p> : (
          <ol>
            {lessons.map((l) => <li key={l._id}>{l.title}</li>)}
          </ol>
        )}
      </div>
    </div>
  );
}
