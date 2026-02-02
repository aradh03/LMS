import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function CreateCourse() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/api/courses", { title, description });
      nav(`/admin/course/${res.data.course._id}/lessons`);
    } catch {
      setErr("Failed to create course. Make sure you are logged in as admin.");
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2>Create Course</h2>
        <form onSubmit={submit}>
          <label><strong>Title</strong></label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />

          <label><strong>Description</strong></label>
          <textarea className="input" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" type="submit">Create</button>
            <Link className="btn light" to="/admin/dashboard">Cancel</Link>
          </div>
        </form>

        {err && <div className="error">{err}</div>}
      </div>
    </div>
  );
}
