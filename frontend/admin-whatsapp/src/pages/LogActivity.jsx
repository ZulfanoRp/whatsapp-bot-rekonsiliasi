import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/logs';

export default function LogActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await axios.get(API_URL);
        setLogs(res.data);
      } catch (err) {
        console.error('Gagal load log activity', err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div>
      <h2>Log Activity</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>No WhatsApp</th>
              <th>Command</th>
              <th>Hasil</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" align="center">
                  Data log kosong
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.log_id}>
                  <td>{log.timestamp}</td>
                  <td>{log.no_whatsapp}</td>
                  <td>{log.command}</td>
                  <td>{log.response_result}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
