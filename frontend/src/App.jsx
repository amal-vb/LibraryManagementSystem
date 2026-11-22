import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Books from "./pages/Books.jsx";
import Members from "./pages/Members.jsx";
import IssueReturn from "./pages/IssueReturn.jsx";
import TransactionHistory from "./pages/TransactionHistory.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/members" element={<Members />} />
        <Route path="/issue-return" element={<IssueReturn />} />
        <Route path="/transactions" element={<TransactionHistory />} />
      </Route>
    </Routes>
  );
}

export default App;