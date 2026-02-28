import Sidebar from "../components/Sidebar";
import "./AdminLayout.css";

export default function AdminLayout({ children }) {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content">
        {children}
      </div>
    </div>
  );
}
