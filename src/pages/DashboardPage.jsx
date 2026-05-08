import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function DashboardPage({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getStats(token);
        setStats(data.stats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [token]);

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of employee management</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e3f2fd", color: "#1976d2" }}>
            👥
          </div>
          <div className="stat-value">{stats?.totalEmployees || 0}</div>
          <div className="stat-label">Total Employees</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fff3e0", color: "#f57c00" }}>
            ⏳
          </div>
          <div className="stat-value">{stats?.pendingVerifications || 0}</div>
          <div className="stat-label">Pending Verifications</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e8f5e9", color: "#388e3c" }}>
            ✓
          </div>
          <div className="stat-value">{stats?.verifiedEmployees || 0}</div>
          <div className="stat-label">Verified Employees</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ffebee", color: "#d32f2f" }}>
            ✕
          </div>
          <div className="stat-value">{stats?.rejectedEmployees || 0}</div>
          <div className="stat-label">Rejected</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f3e5f5", color: "#7b1fa2" }}>
            📝
          </div>
          <div className="stat-value">{stats?.incompleteProfiles || 0}</div>
          <div className="stat-label">Incomplete Profiles</div>
        </div>
      </div>
    </div>
  );
}
