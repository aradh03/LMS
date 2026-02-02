import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/");
  };

  return (
    <div className="nav">
      <div className="nav-inner">
        <div>
          <Link to="/">LMS</Link>
          <span className="badge">Beginner</span>
        </div>

        <div>
          <Link to="/">Courses</Link>
          {user && <Link to="/my-courses">My Courses</Link>}
          {user?.role === "admin" && <Link to="/admin/dashboard">Admin</Link>}


          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <span className="badge">{user.role}</span>
              <button className="btn light" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
