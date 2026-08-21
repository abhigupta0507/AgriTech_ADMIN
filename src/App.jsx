import { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import QuizzesPage from "./pages/QuizzesPage";
import ReportsPage from "./pages/ReportsPage";
import ReportDetailsPage from "./pages/ReportDetailsPage";
import WarningsPage from "./pages/WarningsPage";
import SupportPage from "./pages/SupportPage";
import SupportTicketDetailPage from "./pages/SupportTicketDetailPage";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedReportId, setSelectedReportId] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState("");

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
      if (hash.startsWith("support-")) {
        setSelectedTicketId(hash.replace("support-", ""));
        setCurrentPage("support");
      } else {
        setSelectedTicketId("");
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
    setSelectedTicketId("");
    window.location.hash = "";
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedReportId("");
    setSelectedTicketId("");
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
        {currentPage === "quizzes" && <QuizzesPage token={token} />}
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
        {currentPage === "support" &&
          (selectedTicketId ? (
            <SupportTicketDetailPage
              token={token}
              ticketId={selectedTicketId}
              onBack={() => {
                setSelectedTicketId("");
                window.location.hash = "";
              }}
            />
          ) : (
            <SupportPage token={token} />
          ))}
      </main>
    </div>
  );
}
