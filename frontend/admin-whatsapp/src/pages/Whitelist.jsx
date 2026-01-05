import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/whitelist';

export default function Whitelist() {
  const [list, setList] = useState([]);
  const [noWhatsapp, setNoWhatsapp] = useState('');

  // INITIAL LOAD (AMAN)
  useEffect(() => {
    const loadData = async () => {
      const res = await axios.get(API_URL);
      setList(res.data);
    };
    loadData();
  }, []);

  // RELOAD (dipakai setelah add / update)
  const reload = async () => {
    const res = await axios.get(API_URL);
    setList(res.data);
  };

  // ADD WHITELIST
  const addWhitelist = async () => {
    if (!noWhatsapp) {
      alert('Nomor WhatsApp wajib diisi');
      return;
    }

    await axios.post(API_URL, {
      no_whatsapp: noWhatsapp
    });

    setNoWhatsapp('');
    reload();
  };

  // TOGGLE STATUS
  const toggleStatus = async (id, status) => {
    await axios.put(`${API_URL}/${id}`, {
      status: status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    });
    reload();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Whitelist Management</h2>

      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="No WhatsApp (628xxx)"
          value={noWhatsapp}
          onChange={(e) => setNoWhatsapp(e.target.value)}
        />
        <button onClick={addWhitelist} style={{ marginLeft: 8 }}>
          Tambah
        </button>
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>No WhatsApp</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="3" align="center">
                Data kosong
              </td>
            </tr>
          ) : (
            list.map((w) => (
              <tr key={w.whitelist_id}>
                <td>{w.no_whatsapp}</td>
                <td>{w.status}</td>
                <td>
                  <button
                    onClick={() =>
                      toggleStatus(w.whitelist_id, w.status)
                    }
                  >
                    {w.status === 'ACTIVE'
                      ? 'Nonaktifkan'
                      : 'Aktifkan'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
    </div>
  );
}
