import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaListAlt,
  FaHistory,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Admin Menu</h2>

      <nav className="sidebar-menu">
        <Link
          to="/whitelist"
          className={`sidebar-item ${
            location.pathname === "/whitelist" ? "active" : ""
          }`}
        >
          <FaListAlt className="sidebar-icon" />
          Whitelist
        </Link>

        <Link
          to="/logs"
          className={`sidebar-item ${
            location.pathname === "/logs" ? "active" : ""
          }`}
        >
          <FaHistory className="sidebar-icon" />
          Log Activity
        </Link>

        <Link
          to="/recon-history"
          className={`sidebar-item ${
            location.pathname === "/recon-history" ? "active" : ""
          }`}
        >
          <FaClipboardList className="sidebar-icon" />
          Recon History
        </Link>
      </nav>

      <button className="logout-btn" onClick={logout}>
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}
