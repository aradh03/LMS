import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const res = await api.get("/api/courses");
      setCourses(res.data.courses || []);
    } catch {
      setErr("Failed to load courses.");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        <Link className="btn" to="/admin/course/new">+ Create Course</Link>
      </div>

      {err && <div className="error">{err}</div>}

      {courses.map((c) => (
        <div className="card" key={c._id}>
          <h3 style={{ marginTop: 0 }}>{c.title}</h3>
          <p>{c.description}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Link className="btn secondary" to={`/course/${c._id}`}>View</Link>
            <Link className="btn" to={`/admin/course/${c._id}/lessons`}>Add Lessons</Link>
          </div>
        </div>
      ))}

      {courses.length === 0 && !err && <div className="card">No courses yet. Create your first one.</div>}
    </div>
  );
}
