import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/api";
import Modal from "../components/Modal.jsx";

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  totalCopies: 1,
};

function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Loads the table (uses search and category filter)
  function loadBooks() {
    setLoading(true);
    api
      .get("/books", { params: { title: search, category: category } })
      .then((response) => {
        setBooks(response.data);
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  // Loads every book just to build the category dropdown
  function loadCategories() {
    api
      .get("/books")
      .then((response) => {
        const unique = [...new Set(response.data.map((b) => b.category))];
        setCategories(unique.sort());
      })
      .catch(() => {});
  }

  // Reload the table whenever the search text or category changes
  useEffect(() => {
    loadBooks();
  }, [search, category]);

  useEffect(() => {
    loadCategories();
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function openEdit(book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || "",
      category: book.category,
      totalCopies: book.totalCopies,
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

    const payload = { ...form, totalCopies: Number(form.totalCopies) };
    const request = editingId
      ? api.put("/books/" + editingId, payload)
      : api.post("/books", payload);

    request
      .then(() => {
        setShowModal(false);
        setSuccess(editingId ? "Book updated successfully." : "Book added successfully.");
        loadBooks();
        loadCategories();
      })
      .catch((err) => setFormError(getErrorMessage(err)))
      .finally(() => setSaving(false));
  }

  function handleDelete(book) {
    if (!window.confirm("Delete '" + book.title + "'?")) {
      return;
    }
    setSuccess("");
    setError("");
    api
      .delete("/books/" + book.id)
      .then(() => {
        setSuccess("Book deleted successfully.");
        loadBooks();
        loadCategories();
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  return (
    <div>
      <h1 className="page-title">Books</h1>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="spacer"></div>
          <button className="btn btn-primary" onClick={openAdd}>
            + Add Book
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading books...</div>
        ) : books.length === 0 ? (
          <p className="muted">No books found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn || "-"}</td>
                    <td>{book.category}</td>
                    <td>{book.totalCopies}</td>
                    <td>
                      <span
                        className={
                          "badge " + (book.availableCopies > 0 ? "in-stock" : "out-of-stock")
                        }
                      >
                        {book.availableCopies}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-small" onClick={() => openEdit(book)}>
                        Edit
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(book)}>
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
        <Modal title={editingId ? "Edit Book" : "Add Book"} onClose={() => setShowModal(false)}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input name="author" value={form.author} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ISBN (optional)</label>
                <input name="isbn" value={form.isbn} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input name="category" value={form.category} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Total Copies</label>
              <input
                name="totalCopies"
                type="number"
                min="1"
                value={form.totalCopies}
                onChange={handleChange}
              />
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

export default Books;