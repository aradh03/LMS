import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function Certificate() {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // backend: GET /api/certificate/:courseId returns:
        // { eligible, certificateId, issuedAt, studentName, courseTitle }
        const res = await api.get(`/api/certificate/${courseId}`);
        setData(res.data);
      } catch {
        setErr("Unable to load certificate info.");
      }
    })();
  }, [courseId]);

  const printCert = () => window.print();

  if (err) return <div className="container"><div className="card error">{err}</div></div>;
  if (!data) return <div className="container">Loading...</div>;

  if (!data.eligible) {
    return (
      <div className="container">
        <div className="card">
          <h2>Certificate</h2>
          <p>You are not eligible yet. Finish 100% of the course.</p>
          <Link className="btn" to={`/learn/${courseId}`}>Continue Learning</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Certificate</h2>
        <button className="btn" onClick={printCert}>Print / Save as PDF</button>
      </div>

      {/* Printable certificate */}
      <div className="card" id="certificate" style={{
        padding: 30,
        border: "2px solid #111827",
        background: "white"
      }}>
        <h1 style={{ marginTop: 0, fontSize: 34 }}>Certificate of Completion</h1>
        <p>This certifies that</p>
        <h2 style={{ margin: "10px 0" }}>{data.studentName}</h2>
        <p>has successfully completed the course</p>
        <h2 style={{ margin: "10px 0" }}>{data.courseTitle}</h2>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>Certificate ID:</strong> {data.certificateId}
          </div>
          <div>
            <strong>Issued:</strong> {new Date(data.issuedAt).toLocaleDateString()}
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <p><strong>Signature:</strong> ____________________</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .nav, .btn, a, .card:not(#certificate) { display: none !important; }
          body { background: #fff; }
          #certificate { border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
