import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";

export default function MyCourses() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // backend: GET /api/my-courses returns [{course, percent}]
        const res = await api.get("/api/my-courses");
        setItems(res.data.items || []);
      } catch {
        setErr("Failed to load enrolled courses.");
      }
    })();
  }, []);

  return (
    <div className="container">
      <h2>My Courses</h2>
      {err && <div className="error">{err}</div>}

      {items.map((it) => (
        <div className="card" key={it.course._id}>
          <h3 style={{ marginTop: 0 }}>{it.course.title}</h3>
          <p>{it.course.description}</p>
          <ProgressBar percent={it.percent || 0} />
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <Link className="btn" to={`/learn/${it.course._id}`}>Continue</Link>
            <Link className="btn secondary" to={`/certificate/${it.course._id}`}>Certificate</Link>
          </div>
        </div>
      ))}

      {items.length === 0 && !err && <div className="card">No enrolled courses yet.</div>}
    </div>
  );
}
