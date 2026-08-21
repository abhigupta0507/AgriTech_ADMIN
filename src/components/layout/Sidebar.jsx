export default function Sidebar({
  user,
  currentPage,
  setCurrentPage,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Admin Portal</div>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${currentPage === "dashboard" ? "active" : ""}`}
          onClick={() => setCurrentPage("dashboard")}
        >
          <span className="nav-icon">📊</span>
          Dashboard
        </div>
        <div
          className={`nav-item ${currentPage === "employees" ? "active" : ""}`}
          onClick={() => setCurrentPage("employees")}
        >
          <span className="nav-icon">👥</span>
          Employees
        </div>
        <div
          className={`nav-item ${currentPage === "quizzes" ? "active" : ""}`}
          onClick={() => setCurrentPage("quizzes")}
        >
          <span className="nav-icon">📝</span>
          Quizzes
        </div>
        <div
          className={`nav-item ${currentPage === "reports" ? "active" : ""}`}
          onClick={() => setCurrentPage("reports")}
        >
          <span className="nav-icon">📋</span>
          Reports
        </div>
        <div
          className={`nav-item ${currentPage === "warnings" ? "active" : ""}`}
          onClick={() => setCurrentPage("warnings")}
        >
          <span className="nav-icon">⚠️</span>
          Warnings
        </div>
        <div
          className={`nav-item ${currentPage === "support" ? "active" : ""}`}
          onClick={() => setCurrentPage("support")}
        >
          <span className="nav-icon">💬</span>
          Support
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0) || "A"}</div>
          <div className="user-details">
            <div className="user-name">{user?.name || "Admin"}</div>
            <div className="user-role">{user?.role || "Administrator"}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
