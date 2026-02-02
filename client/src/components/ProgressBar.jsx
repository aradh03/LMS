import React from "react";

export default function ProgressBar({ percent = 0 }) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>Progress</strong>
        <span>{safe}%</span>
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: 999, height: 10, overflow: "hidden" }}>
        <div style={{ width: `${safe}%`, height: "100%", background: "#111827" }} />
      </div>
    </div>
  );
}
