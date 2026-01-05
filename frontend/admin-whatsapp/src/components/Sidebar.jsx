import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div style={{ width: 200, borderRight: '1px solid #ccc', padding: 16 }}>
      <h4>Admin Menu</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/whitelist">Whitelist</Link></li>
        <li><Link to="/logs">Log Activity</Link></li>
        <li><Link to="/recon-history">Recon History</Link></li>
      </ul>
      <button onClick={logout} style={{ marginTop: 16 }}>Logout</button>
    </div>
  );
}
