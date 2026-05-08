import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function WarningsPage({ token }) {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    isRead: "",
    severity: "",
    page: 1,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadWarnings();
  }, [token, filters]);

  const loadWarnings = async () => {
    setLoading(true);
    try {
      const data = await api.getWarnings(token, filters);
      setWarnings(data.warnings);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to load warnings:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getSeverityBadgeClass = (severity) => {
    const classes = {
      low: "badge-info",
      medium: "badge-warning",
      high: "badge-danger",
      critical: "badge-critical",
    };
    return classes[severity] || "badge-secondary";
  };

  const getCategoryLabel = (category) => {
    const labels = {
      fraud: "Fraud",
      poor_quality: "Poor Quality",
      payment_issue: "Payment Issue",
      delivery_issue: "Delivery Issue",
      communication_issue: "Communication Issue",
      harassment: "Harassment",
      policy_violation: "Policy Violation",
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

  if (loading && !warnings.length) {
    return (
      <div className="loading">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div className="warnings-page">
      <div className="page-header">
        <h1 className="page-title">Warnings Management</h1>
        <p className="page-subtitle">All warnings issued to users</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Read Status:</label>
          <select
            value={filters.isRead}
            onChange={(e) => handleFilterChange("isRead", e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity:</label>
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
            className="filter-select"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button
          onClick={() => setFilters({ isRead: "", severity: "", page: 1 })}
          className="btn-secondary"
        >
          Clear Filters
        </button>
      </div>

      {/* Warnings Grid */}
      <div className="warnings-grid">
        {warnings.length === 0 ? (
          <div className="empty-state">
            <p>No warnings found</p>
          </div>
        ) : (
          warnings.map((warning) => (
            <div key={warning._id} className="warning-card">
              <div className="warning-header">
                <div className="warning-badges">
                  <span
                    className={`badge ${getSeverityBadgeClass(warning.severity)}`}
                  >
                    {warning.severity.toUpperCase()}
                  </span>
                  <span className="badge badge-outline">
                    {getCategoryLabel(warning.category)}
                  </span>
                  {!warning.isRead && (
                    <span className="badge badge-primary">Unread</span>
                  )}
                </div>
                <span className="warning-date">
                  {formatDate(warning.createdAt)}
                </span>
              </div>

              <h3 className="warning-title">{warning.title}</h3>

              <p className="warning-message">{warning.message}</p>

              <div className="warning-footer">
                <div className="warning-user">
                  <strong>Warned User:</strong>
                  <span className="user-name">
                    {getUserName(warning.userId, warning.userModel)}
                  </span>
                  <span className="badge badge-light">{warning.userModel}</span>
                </div>

                <div className="warning-issuer">
                  <strong>Issued by:</strong>
                  <span>
                    {warning.issuedBy?.name ||
                      warning.issuedBy?.username ||
                      "Admin"}
                  </span>
                </div>

                {warning.readAt && (
                  <div className="warning-read">
                    <span className="read-label">Read on:</span>
                    <span>{formatDate(warning.readAt)}</span>
                  </div>
                )}

                {warning.relatedReport && (
                  <div className="warning-report">
                    <a
                      href={`#report-${warning.relatedReport._id}`}
                      className="btn-link"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.hash = `report-${warning.relatedReport._id}`;
                      }}
                    >
                      View Related Report →
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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
  );
}
