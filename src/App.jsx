import { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import ReportsPage from "./pages/ReportsPage";
import ReportDetailsPage from "./pages/ReportDetailsPage";
import WarningsPage from "./pages/WarningsPage";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedReportId, setSelectedReportId] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    const savedUser = localStorage.getItem("adminUser");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("report-")) {
        setSelectedReportId(hash.replace("report-", ""));
        setCurrentPage("reports");
      } else {
        setSelectedReportId("");
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    setUser(null);
    setCurrentPage("dashboard");
    setSelectedReportId("");
    window.location.hash = "";
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedReportId("");
    if (window.location.hash) {
      window.location.hash = "";
    }
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} currentPage={currentPage} setCurrentPage={handlePageChange} onLogout={handleLogout} />
      <main className="main-content">
        {currentPage === "dashboard" && <DashboardPage token={token} />}
        {currentPage === "employees" && <EmployeesPage token={token} />}
        {currentPage === "reports" &&
          (selectedReportId ? (
            <ReportDetailsPage
              token={token}
              reportId={selectedReportId}
              onBack={() => {
                setSelectedReportId("");
                window.location.hash = "";
              }}
            />
          ) : (
            <ReportsPage token={token} />
          ))}
        {currentPage === "warnings" && <WarningsPage token={token} />}
      </main>
    </div>
  );
}
