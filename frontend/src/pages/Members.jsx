import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/api";
import Modal from "../components/Modal.jsx";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
};

function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function loadMembers() {
    setLoading(true);
    api
      .get("/members", { params: { name: search } })
      .then((response) => {
        setMembers(response.data);
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  // Reload the table whenever the search text changes
  useEffect(() => {
    loadMembers();
  }, [search]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function openEdit(member) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
    });
    setFormError("");
    setShowModal(true);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const request = editingId
      ? api.put("/members/" + editingId, form)
      : api.post("/members", form);

    request
      .then(() => {
        setShowModal(false);
        setSuccess(editingId ? "Member updated successfully." : "Member registered successfully.");
        loadMembers();
      })
      .catch((err) => setFormError(getErrorMessage(err)))
      .finally(() => setSaving(false));
  }

  function handleDelete(member) {
    if (!window.confirm("Delete member '" + member.name + "'?")) {
      return;
    }
    setSuccess("");
    setError("");
    api
      .delete("/members/" + member.id)
      .then(() => {
        setSuccess("Member deleted successfully.");
        loadMembers();
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  return (
    <div>
      <h1 className="page-title">Members</h1>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="spacer"></div>
          <button className="btn btn-primary" onClick={openAdd}>
            + Register Member
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading members...</div>
        ) : members.length === 0 ? (
          <p className="muted">No members found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.phone || "-"}</td>
                    <td>{member.joinDate}</td>
                    <td>
                      <button className="btn btn-small" onClick={() => openEdit(member)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(member)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editingId ? "Edit Member" : "Register Member"}
          onClose={() => setShowModal(false)}
        >
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone (optional)</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Members;