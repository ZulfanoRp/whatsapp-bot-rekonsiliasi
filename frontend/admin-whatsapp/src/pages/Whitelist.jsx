import React, { useEffect, useState } from "react";
import "./Whitelist.css";

const API_URL = "http://localhost:3000/api/whitelist";

export default function Whitelist() {
  const [list, setList] = useState([]);
  const [filterText, setFilterText] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [newNama, setNewNama] = useState("");
  const [newNomor, setNewNomor] = useState("");

  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  

  const loadData = async () => {
  const res = await fetch(API_URL);
  const data = await res.json();
  setList(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setNewNama("");
    setNewNomor("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewNama("");
    setNewNomor("");
  };

  const handleAdd = async () => {
    if (!newNama || !newNomor) return alert("Nama dan nomor wajib diisi.");

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newNama, no_whatsapp: newNomor }),
    });

    closeAddModal();
    loadData();
  };

  const openEditModal = (item) => {
    setEditData(item);
    setNewNama(item.name);
    setNewNomor(item.no_whatsapp);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditData(null);
    setNewNama("");
    setNewNomor("");
  };

  const handleUpdate = async () => {
  if (!editData) return;

  const payload = {
    name: newNama,
    no_whatsapp: newNomor
  };

  console.log("UPDATE SEND:", payload);

  const res = await fetch(`${API_URL}/${editData.whitelist_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("UPDATE RESPONSE:", data);

  closeEditModal();
  loadData();
};


  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    await fetch(`${API_URL}/${deleteId}`, {
      method: "DELETE",
    });

    closeDeleteModal();
    loadData();
  };

  const toggleStatus = async (item) => {
  const newStatus = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  console.log("TOGGLE SEND:", { id: item.whitelist_id, status: newStatus });

  try {
    const res = await fetch(`${API_URL}/status/${item.whitelist_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();
    console.log("TOGGLE RESPONSE:", data);

    loadData(); // refresh table
  } catch (err) {
    console.error("TOGGLE ERROR:", err);
  }
};


  const filteredItems = list.filter((x) =>
    `${x.name} ${x.no_whatsapp}`
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );

  return (
    <div className="content-area">

      <div className="header-row">
        <h1 className="page-title">Whitelist Management</h1>

        <button className="btn-add" onClick={openAddModal}>
          Tambah
        </button>
      </div>

      <div className="search-box">
        <input
          className="search-bar"
          placeholder="Cari nama atau nomor..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>No WhatsApp</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.whitelist_id}>
                <td>{item.name}</td>
                <td>{item.no_whatsapp}</td>

                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.status === "ACTIVE"}
                      onChange={() => toggleStatus(item)}
                    />
                    <span className="slider" />
                  </label>
                  
                </td>

                <td>
                  <button
                    className="btn-edit"
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => openDeleteModal(item.whitelist_id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">Tambah Whitelist</h2>

            <input
              className="modal-input"
              placeholder="Nama"
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
            />

            <input
              className="modal-input"
              placeholder="No WhatsApp (628xxx)"
              value={newNomor}
              onChange={(e) => setNewNomor(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-save" onClick={handleAdd}>Simpan</button>
              <button className="btn-cancel" onClick={closeAddModal}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">Edit Data</h2>

            <input
              className="modal-input"
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
            />

            <input
              className="modal-input"
              value={newNomor}
              onChange={(e) => setNewNomor(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-save" onClick={handleUpdate}>Update</button>
              <button className="btn-cancel" onClick={closeEditModal}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">Yakin ingin menghapus?</h2>

            <div className="modal-actions">
              <button className="btn-delete" onClick={handleDelete}>
                Hapus
              </button>
              <button className="btn-cancel" onClick={closeDeleteModal}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
