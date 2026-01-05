import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/recon-history';

export default function ReconHistory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get(API_URL);
        setList(res.data);
      } catch (err) {
        console.error('Gagal load recon history', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const downloadFile = (id) => {
    window.open(`${API_URL}/download/${id}`, '_blank');
  };

  return (
    <div>
      <h2>Recon History</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Total CID</th>
              <th>Total Internal</th>
              <th>Total Partner</th>
              <th>Selisih</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="6" align="center">
                  Data recon kosong
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr key={r.recon_id}>
                  <td>{r.created_at}</td>
                  <td>{r.total_cid}</td>
                  <td>{r.total_internal}</td>
                  <td>{r.total_partner}</td>
                  <td>{r.total_selisih}</td>
                  <td>
                    <button onClick={() => downloadFile(r.recon_id)}>
                      Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
