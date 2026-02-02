import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // backend: GET /api/courses (published)
        const res = await api.get("/api/courses");
        setCourses(res.data.courses || []);
      } catch (e) {
        setErr("Failed to load courses.");
      }
    })();
  }, []);

  return (
    <div className="container">
      <h2>Available Courses</h2>
      {err && <div className="error">{err}</div>}

      <div className="grid">
        {courses.map((c) => (
          <div className="card" key={c._id}>
            <h3 style={{ marginTop: 0 }}>{c.title}</h3>
            <p>{c.description}</p>
            <Link className="btn" to={`/course/${c._id}`}>
              View Course
            </Link>
          </div>
        ))}
      </div>

      {courses.length === 0 && !err && (
        <div className="card">No courses yet. Ask admin to publish one.</div>
      )}
    </div>
  );
}
