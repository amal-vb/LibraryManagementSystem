import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/books", label: "Books", icon: "📚" },
  { to: "/members", label: "Members", icon: "👥" },
  { to: "/issue-return", label: "Issue / Return", icon: "🔄" },
  { to: "/transactions", label: "Transaction History", icon: "🧾" },
];

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="brand">📖 Library Admin</div>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
          <span className="topbar-title">Library Management System</span>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;