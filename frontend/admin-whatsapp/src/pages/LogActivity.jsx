import React, { useEffect, useState } from "react";
import "./LogActivity.css";

const API_URL = "http://localhost:3000/api/logs";

const LogActivity = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  const loadData = async () => {
    try {
      const res = await fetch(
        `${API_URL}?search=${search}&page=${page}&limit=${limit}`
      );
      const data = await res.json();
      setList(data.list);
      setTotal(data.total);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  // Format waktu
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ", " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="content-area">
      <h1 className="page-title">Log Activity</h1>

      {/* SEARCH BAR */}
      <div className="search-box">
        <input
          className="search-bar"
          placeholder="Cari nama, nomor, command..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-search" onClick={handleSearch}>
          Cari
        </button>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>No WhatsApp</th>
              <th>Command</th>
              <th>Hasil</th>
              <th>Waktu</th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  Tidak ada data
                </td>
              </tr>
            ) : (
              list.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.no_whatsapp}</td>
                  <td>{item.command}</td>
                  <td>{item.response_result}</td>
                  <td>{formatDate(item.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="pg-btn"
        >
          Prev
        </button>

        <span className="pg-info">
          Page {page} dari {Math.ceil(total / limit)}
        </span>

        <button
          disabled={page >= Math.ceil(total / limit)}
          onClick={() => setPage(page + 1)}
          className="pg-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LogActivity;
