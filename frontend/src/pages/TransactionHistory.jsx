import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/api";

// Today's date as YYYY-MM-DD in the local time zone
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/transactions")
      .then((response) => setTransactions(response.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const today = todayString();
  const text = search.trim().toLowerCase();

  // Filter in the browser using the search text and status
  const visible = transactions.filter((t) => {
    const matchesText =
      text === "" ||
      t.bookTitle.toLowerCase().includes(text) ||
      t.memberName.toLowerCase().includes(text);
    const matchesStatus = status === "" || t.status === status;
    return matchesText && matchesStatus;
  });

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div>
      <h1 className="page-title">Transaction History</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search by book or member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="ISSUED">Issued</option>
            <option value="RETURNED">Returned</option>
          </select>
          <div className="spacer"></div>
          <span className="muted">
            Showing {visible.length} of {transactions.length}
          </span>
        </div>

        {visible.length === 0 ? (
          <p className="muted">No transactions found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => {
                  const overdue = t.status === "ISSUED" && t.dueDate < today;
                  return (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.bookTitle}</td>
                      <td>{t.memberName}</td>
                      <td>{t.issueDate}</td>
                      <td>{t.dueDate}</td>
                      <td>{t.returnDate || "-"}</td>
                      <td>
                        <span className={"badge " + t.status.toLowerCase()}>{t.status}</span>
                        {overdue && (
                          <span className="badge out-of-stock" style={{ marginLeft: "6px" }}>
                            Overdue
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;