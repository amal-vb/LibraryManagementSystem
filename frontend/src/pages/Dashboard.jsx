import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/api";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((response) => setData(response.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  const stats = [
    { label: "Total Books", value: data.totalBooks, color: "blue" },
    { label: "Total Members", value: data.totalMembers, color: "green" },
    { label: "Currently Issued", value: data.issuedBooks, color: "orange" },
    { label: "Available Copies", value: data.availableBooks, color: "purple" },
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={"stat-card " + stat.color}>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="card-title">Recent Transactions</h2>
        {data.recentTransactions.length === 0 ? (
          <p className="muted">No transactions yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.bookTitle}</td>
                    <td>{t.memberName}</td>
                    <td>{t.issueDate}</td>
                    <td>{t.dueDate}</td>
                    <td>
                      <span className={"badge " + t.status.toLowerCase()}>{t.status}</span>
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

export default Dashboard;