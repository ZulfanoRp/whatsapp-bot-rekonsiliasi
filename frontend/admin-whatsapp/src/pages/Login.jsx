import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000/api/auth/login";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(API_URL, { username, password });
      console.log("LOGIN RESULT:", response.data);

      if (response.data?.success) {
        localStorage.setItem("isLoggedIn", "true");
        navigate("/whitelist");
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat login.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* HEADER */}
        <div className="login-header">
          <div className="logo-circle">
            <i className="fa-brands fa-whatsapp"></i>
          </div>
          <h2>WhatsApp Config</h2>
          <p>Dashboard Login</p>
        </div>

        {/* CONTENT */}
        <form className="login-content" onSubmit={handleLogin}>

          <label>Username</label>
          <div className="input-box">
            <i className="fa-solid fa-user"></i>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <label>Password</label>
          <div className="input-box">
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="login-button" type="submit">
            Login
          </button>
        </form>

        {/* FOOTER */}
        <div className="login-footer">Created By Team 2</div>
      </div>
    </div>
  );
}
