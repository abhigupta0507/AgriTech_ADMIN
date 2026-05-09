import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ReportsPage({ token }) {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    reportType: "",
    accusedModel: "",
    page: 1,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadReportsAndStats();
  }, [token, filters]);

  const loadReportsAndStats = async () => {
    setLoading(true);
    try {
      const [reportsData, statsData] = await Promise.all([
        api.getReports(token, filters),
        api.getReportStats(token),
      ]);

      //console.log(reportsData.reports);
      setReports(reportsData.reports);
      setPagination(reportsData.pagination);
      setStats(statsData.stats);
    } catch (error) {
      console.error("Failed to load reports:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      submitted: "badge-warning",
      under_review: "badge-info",
      accepted: "badge-success",
      rejected: "badge-danger",
    };
    return classes[status] || "badge-secondary";
  };

  const getCategoryLabel = (category) => {
    const labels = {
      fraud: "Fraud",
      poor_quality: "Poor Quality",
      payment_issue: "Payment Issue",
      delivery_issue: "Delivery Issue",
      communication_issue: "Communication Issue",
      harassment: "Harassment",
      other: "Other",
    };
    return labels[category] || category;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserName = (user, model) => {
    if (!user) return "N/A";
    if (model === "Vendor") return user.organizationName || user.name || "N/A";
    if (model === "Buyer")
      return user.companyName || user.contactPerson || "N/A";
    return user.name || "N/A";
  };

  if (loading && !reports.length) {
    return (
      <div className="loading">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">Reports Management</h1>
        <p className="page-subtitle">Review and manage user reports</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "#e3f2fd", color: "#1976d2" }}
            >
              📋
            </div>
            <div className="stat-value">{stats.total || 0}</div>
            <div className="stat-label">Total Reports</div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "#fff3e0", color: "#f57c00" }}
            >
              ⏳
            </div>
            <div className="stat-value">{stats.submitted || 0}</div>
            <div className="stat-label">Pending Review</div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "#e1f5fe", color: "#0288d1" }}
            >
              🔍
            </div>
            <div className="stat-value">{stats.underReview || 0}</div>
            <div className="stat-label">Under Review</div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "#fff9c4", color: "#f9a825" }}
            >
              ⚠️
            </div>
            <div className="stat-value">{stats.warnings || 0}</div>
            <div className="stat-label">Warnings Issued</div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "#ffebee", color: "#d32f2f" }}
            >
              🚫
            </div>
            <div className="stat-value">{stats.suspensions || 0}</div>
            <div className="stat-label">Suspensions</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Report Type:</label>
          <select
            value={filters.reportType}
            onChange={(e) => handleFilterChange("reportType", e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="order">Order</option>
            <option value="auction">Auction</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Accused Type:</label>
          <select
            value={filters.accusedModel}
            onChange={(e) => handleFilterChange("accusedModel", e.target.value)}
            className="filter-select"
          >
            <option value="">All Users</option>
            <option value="Vendor">Vendor</option>
            <option value="Buyer">Buyer</option>
            <option value="Farmer">Farmer</option>
          </select>
        </div>

        <button
          onClick={() =>
            setFilters({
              status: "",
              reportType: "",
              accusedModel: "",
              page: 1,
            })
          }
          className="btn-secondary"
        >
          Clear Filters
        </button>
      </div>

      {/* Reports Table */}
      <div className="card">
        <div className="card-header">
          <h2>Reports List</h2>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Reporter</th>
                <th>Accused</th>
                <th>Category</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id}>
                    <td>
                      <code className="report-id">{report._id.slice(-8)}</code>
                    </td>
                    <td>{formatDate(report.createdAt)}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-name">
                          {report.reportedBy?.name || "N/A"}
                        </div>
                        <div className="user-phone">
                          {report.reportedBy?.phone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-name">
                          {getUserName(report.accusedUser, report.accusedModel)}
                        </div>
                        <span className="badge badge-secondary">
                          {report.accusedModel}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline">
                        {getCategoryLabel(report.category)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-light">
                        {report.reportType}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(report.status)}`}
                      >
                        {report.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      {report.actionTaken !== "none" && (
                        <span className="badge badge-info">
                          {report.actionTaken}
                        </span>
                      )}
                    </td>
                    <td>
                      <a
                        href={`#report-${report._id}`}
                        className="btn-link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.hash = `report-${report._id}`;
                        }}
                      >
                        View Details →
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === pagination.pages}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
