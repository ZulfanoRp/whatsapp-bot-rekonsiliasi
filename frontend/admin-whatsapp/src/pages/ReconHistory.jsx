// src/pages/ReconHistory.jsx
import React, { useEffect, useState } from "react";
import "./ReconHistory.css";

const API_URL = "http://localhost:3000/api/recon-history";

export default function ReconHistory() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const loadData = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = list.filter((item) => {
    const s = search.toLowerCase();
    return (
      item.total_cid?.toString().includes(s) ||
      item.total_internal?.toString().includes(s) ||
      item.total_partner?.toString().includes(s) ||
      item.total_selisih?.toString().includes(s) ||
      item.created_at?.toLowerCase().includes(s)
    );
  });

  const maxPage = Math.ceil(filtered.length / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const view = filtered.slice(start, start + pageSize);

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="content-area">
      <h1 className="page-title">Recon History</h1>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Cari tanggal, total, selisih..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="table-wrapper">
        <table>
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
            {view.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              view.map((item) => (
                <tr key={item.recon_id}>
                  <td>{formatDate(item.created_at)}</td>
                  <td>{item.total_cid}</td>
                  <td>{item.total_internal}</td>
                  <td>{item.total_partner}</td>
                  <td>{item.total_selisih}</td>
                  <td>
                    <a
                      className="btn-download"
                      href={`${API_URL}/download/${item.recon_id}`}
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-row">
        <button
          className="btn-pg"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>

        <span className="page-info">
          Page {page} dari {maxPage}
        </span>

        <button
          className="btn-pg"
          onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
          disabled={page === maxPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}
