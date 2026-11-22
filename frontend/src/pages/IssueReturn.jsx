import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/api";

// Formats a date as YYYY-MM-DD using the local time zone
function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function defaultDates() {
  const today = new Date();
  const due = new Date();
  due.setDate(due.getDate() + 14);
  return { issueDate: toInputDate(today), dueDate: toInputDate(due) };
}

function IssueReturn() {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ memberId: "", bookId: "", ...defaultDates() });
  const [issuing, setIssuing] = useState(false);
  const [returningId, setReturningId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Loads both dropdowns and the "currently issued" table from MySQL
  function loadAll() {
    return Promise.all([
      api.get("/members"),
      api.get("/books"),
      api.get("/transactions/active"),
    ])
      .then(([membersRes, booksRes, activeRes]) => {
        setMembers(membersRes.data);
        setBooks(booksRes.data);
        setActive(activeRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleIssue(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Quick checks before calling the server
    if (!form.memberId) {
      setError("Please select a member.");
      return;
    }
    if (!form.bookId) {
      setError("Please select a book.");
      return;
    }
    if (!form.issueDate || !form.dueDate) {
      setError("Please choose both the issue date and the due date.");
      return;
    }
    if (form.dueDate < form.issueDate) {
      setError("Due date cannot be before the issue date.");
      return;
    }

    setIssuing(true);
    api
      .post("/transactions/issue", {
        memberId: Number(form.memberId),
        bookId: Number(form.bookId),
        issueDate: form.issueDate,
        dueDate: form.dueDate,
      })
      .then((response) => {
        const t = response.data;
        setSuccess("Issued '" + t.bookTitle + "' to " + t.memberName + ".");
        setForm({ memberId: "", bookId: "", ...defaultDates() });
        return loadAll();
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIssuing(false));
  }

  function handleReturn(transaction) {
    setError("");
    setSuccess("");
    setReturningId(transaction.id);

    api
      .put("/transactions/" + transaction.id + "/return")
      .then(() => {
        setSuccess("Returned '" + transaction.bookTitle + "' from " + transaction.memberName + ".");
        return loadAll();
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        loadAll();
      })
      .finally(() => setReturningId(null));
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const today = toInputDate(new Date());

  return (
    <div>
      <h1 className="page-title">Issue / Return</h1>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: "24px" }}>
        <h2 className="card-title">Issue a Book</h2>
        <form onSubmit={handleIssue}>
          <div className="form-row">
            <div className="form-group">
              <label>Member</label>
              <select name="memberId" value={form.memberId} onChange={handleChange}>
                <option value="">-- Select member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Book</label>
              <select name="bookId" value={form.bookId} onChange={handleChange}>
                <option value="">-- Select book --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                    {b.title} - {b.availableCopies > 0 ? b.availableCopies + " available" : "out of stock"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Issue Date</label>
              <input
                type="date"
                name="issueDate"
                max={today}
                value={form.issueDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                min={form.issueDate}
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={issuing}>
            {issuing ? "Issuing..." : "Issue Book"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="card-title">Currently Issued Books</h2>
        {active.length === 0 ? (
          <p className="muted">No books are currently issued.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {active.map((t) => (
                  <tr key={t.id}>
                    <td>{t.bookTitle}</td>
                    <td>{t.memberName}</td>
                    <td>{t.issueDate}</td>
                    <td>{t.dueDate}</td>
                    <td>
                      <button
                        className="btn btn-small btn-primary"
                        disabled={returningId === t.id}
                        onClick={() => handleReturn(t)}
                      >
                        {returningId === t.id ? "Returning..." : "Return"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueReturn;