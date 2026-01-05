import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000/api/auth/login';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');

    if (!username || !password) {
      setError('Username dan password wajib diisi');
      return;
    }

    try {
      const res = await axios.post(API_URL, {
        username,
        password
      });

      if (res.data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', res.data.username);
        navigate('/whitelist');
      } else {
        setError('Username atau password salah');
      }
    } catch {
      setError('Gagal menghubungi server');
    }
  };

  return (
    <div style={{ marginTop: 100, textAlign: 'center' }}>
      <h2>Admin Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
