import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ReportDetailsPage({ token, reportId, onBack }) {
  const [report, setReport] = useState(null);
  const [accusedStats, setAccusedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Warning modal state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningForm, setWarningForm] = useState({
    severity: "medium",
    title: "",
    message: "",
    category: "",
  });

  // Suspend modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  // Update status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: "",
    adminNotes: "",
  });

  useEffect(() => {
    loadReportDetails();
  }, [reportId, token]);

  const loadReportDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getReportDetails(token, reportId);
      setReport(data.report);
      setAccusedStats(data.accusedStats);
    } catch (error) {
      console.error("Failed to load report:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusForm.status) {
      alert("Please select a status");
      return;
    }

    setActionLoading(true);
    try {
      await api.updateReportStatus(token, reportId, statusForm);
      alert("Report status updated successfully");
      setShowStatusModal(false);
      loadReportDetails();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueWarning = async (e) => {
    e.preventDefault();
    if (!warningForm.title || !warningForm.message || !warningForm.category) {
      alert("Please fill all required fields");
      return;
    }

    setActionLoading(true);
    try {
      await api.issueWarning(token, reportId, warningForm);
      alert("Warning issued successfully");
      setShowWarningModal(false);
      loadReportDetails();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (e) => {
    e.preventDefault();
    if (!suspendReason.trim()) {
      alert("Please provide a reason for suspension");
      return;
    }

    const confirmMsg = `Are you sure you want to PERMANENTLY SUSPEND this ${report.accusedModel}?\n\nThis action cannot be undone automatically.`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.suspendUser(token, reportId, { reason: suspendReason });
      alert("User suspended successfully");
      setShowSuspendModal(false);
      loadReportDetails();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  const canTakeAction = () => {
    return (
      report && report.status !== "rejected" && report.actionTaken === "none"
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner"></span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="error-message">
        <p>Report not found</p>
        <button onClick={onBack} className="btn-primary">
          Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className="report-details-page">
      {/* Header */}
      <div className="page-header">
        <button onClick={onBack} className="btn-back">
          ← Back to Reports
        </button>
        <h1 className="page-title">Report Details</h1>
        <p className="page-subtitle">ID: {report._id}</p>
      </div>

      {/* Action Bar */}
      {canTakeAction() && (
        <div className="action-bar">
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn-secondary"
          >
            Update Status
          </button>
          <button
            onClick={() => setShowWarningModal(true)}
            className="btn-warning"
          >
            Issue Warning
          </button>
          <button
            onClick={() => setShowSuspendModal(true)}
            className="btn-danger"
          >
            Suspend User
          </button>
        </div>
      )}

      {/* Status Alert */}
      {report.status === "rejected" && (
        <div className="alert alert-info">
          This report has been rejected and dismissed. No further action can be
          taken.
        </div>
      )}

      {report.actionTaken !== "none" && (
        <div className="alert alert-success">
          Action taken: <strong>{report.actionTaken}</strong>
          {report.reviewedAt && ` on ${formatDate(report.reviewedAt)}`}
        </div>
      )}

      <div className="details-grid">
        {/* Report Information */}
        <div className="card">
          <div className="card-header">
            <h2>Report Information</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span
                className={`badge ${report.status === "accepted" ? "badge-success" : report.status === "rejected" ? "badge-danger" : "badge-warning"}`}
              >
                {report.status.replace("_", " ").toUpperCase()}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Report Type:</span>
              <span>{report.reportType}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Category:</span>
              <span className="badge badge-outline">
                {getCategoryLabel(report.category)}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Submitted:</span>
              <span>{formatDate(report.createdAt)}</span>
            </div>

            {report.reviewedBy && (
              <>
                <div className="info-row">
                  <span className="info-label">Reviewed By:</span>
                  <span>
                    {report.reviewedBy.name || report.reviewedBy.username}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Reviewed At:</span>
                  <span>{formatDate(report.reviewedAt)}</span>
                </div>
              </>
            )}

            {report.adminNotes && (
              <div className="info-row">
                <span className="info-label">Admin Notes:</span>
                <p className="admin-notes">{report.adminNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reporter Information */}
        <div className="card">
          <div className="card-header">
            <h2>Reporter</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span>{report.reportedBy?.name || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span>{report.reportedBy?.phone || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address:</span>
              <span>{report.reportedBy?.address || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Accused Information */}
        <div className="card">
          <div className="card-header">
            <h2>Accused {report.accusedModel}</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span>
                {getUserName(report.accusedUser, report.accusedModel)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span>{report.accusedUser?.phone || "N/A"}</span>
            </div>
            {report.accusedUser?.suspended && (
              <div className="info-row">
                <span className="badge badge-danger">SUSPENDED</span>
                {report.accusedUser.suspendedAt && (
                  <span className="info-sublabel">
                    Since {formatDate(report.accusedUser.suspendedAt)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Accused Stats */}
        {accusedStats && (
          <div className="card">
            <div className="card-header">
              <h2>User History</h2>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Total Reports:</span>
                <span className="badge badge-warning">
                  {accusedStats.totalReports}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Total Warnings:</span>
                <span className="badge badge-info">
                  {accusedStats.totalWarnings}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="card">
        <div className="card-header">
          <h2>Report Description</h2>
        </div>
        <div className="card-body">
          <p className="report-description">{report.description}</p>
        </div>
      </div>

      {/* Attachments */}
      {report.attachments && report.attachments.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Attachments</h2>
          </div>
          <div className="card-body">
            <div className="attachments-grid">
              {report.attachments.map((att, idx) => (
                <div key={idx} className="attachment-item">
                  {att.type === "image" ? (
                    <img src={att.url} alt={`Attachment ${idx + 1}`} />
                  ) : (
                    <a href={att.url} target="_blank" rel="noopener noreferrer">
                      📄 Document {idx + 1}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Related Transaction */}
      {(report.relatedOrder || report.relatedSale) && (
        <div className="card">
          <div className="card-header">
            <h2>Related Transaction</h2>
          </div>
          <div className="card-body">
            {report.relatedOrder && (
              <div>
                <div className="info-row">
                  <span className="info-label">Type:</span>
                  <span>Order</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Product:</span>
                  <span>
                    {report.relatedOrder.productSnapshot?.name || "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Amount:</span>
                  <span>₹{report.relatedOrder.totalAmount}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span>{report.relatedOrder.status}</span>
                </div>
              </div>
            )}
            {report.relatedSale && (
              <div>
                <div className="info-row">
                  <span className="info-label">Type:</span>
                  <span>Auction/Sale</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Quantity:</span>
                  <span>{report.relatedSale.quantity}</span>
                </div>
                {report.relatedSale.finalPrice && (
                  <div className="info-row">
                    <span className="info-label">Final Price:</span>
                    <span>₹{report.relatedSale.finalPrice}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning Issued */}
      {report.warningIssued && (
        <div className="card">
          <div className="card-header">
            <h2>Warning Issued</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Title:</span>
              <span>{report.warningIssued.title}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Severity:</span>
              <span
                className={`badge badge-${report.warningIssued.severity === "high" || report.warningIssued.severity === "critical" ? "danger" : "warning"}`}
              >
                {report.warningIssued.severity}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Message:</span>
              <p>{report.warningIssued.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showStatusModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowStatusModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Report Status</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateStatus}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) =>
                      setStatusForm({ ...statusForm, status: e.target.value })
                    }
                    required
                  >
                    <option value="">Select status</option>
                    <option value="under_review">Under Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected (Dismiss)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Admin Notes</label>
                  <textarea
                    value={statusForm.adminNotes}
                    onChange={(e) =>
                      setStatusForm({
                        ...statusForm,
                        adminNotes: e.target.value,
                      })
                    }
                    rows="4"
                    placeholder="Optional notes about this decision..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowWarningModal(false)}
        >
          <div
            className="modal modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Issue Warning</h2>
              <button
                onClick={() => setShowWarningModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleIssueWarning}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Severity *</label>
                  <select
                    value={warningForm.severity}
                    onChange={(e) =>
                      setWarningForm({
                        ...warningForm,
                        severity: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={warningForm.category}
                    onChange={(e) =>
                      setWarningForm({
                        ...warningForm,
                        category: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select category</option>
                    <option value="fraud">Fraud</option>
                    <option value="poor_quality">Poor Quality</option>
                    <option value="payment_issue">Payment Issue</option>
                    <option value="delivery_issue">Delivery Issue</option>
                    <option value="communication_issue">
                      Communication Issue
                    </option>
                    <option value="harassment">Harassment</option>
                    <option value="policy_violation">Policy Violation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={warningForm.title}
                    onChange={(e) =>
                      setWarningForm({ ...warningForm, title: e.target.value })
                    }
                    placeholder="Brief warning title"
                    maxLength="200"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={warningForm.message}
                    onChange={(e) =>
                      setWarningForm({
                        ...warningForm,
                        message: e.target.value,
                      })
                    }
                    rows="5"
                    placeholder="Detailed warning message to the user..."
                    maxLength="1000"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-warning"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Issuing..." : "Issue Warning"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuspendModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSuspendModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Suspend User Account</h2>
              <button
                onClick={() => setShowSuspendModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSuspendUser}>
              <div className="modal-body">
                <div className="alert alert-danger">
                  <strong>⚠️ Warning:</strong> This will PERMANENTLY suspend the
                  user's account. They will not be able to access the platform.
                </div>

                <div className="form-group">
                  <label>Suspension Reason *</label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    rows="4"
                    placeholder="Provide a clear reason for suspension..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Suspending..." : "Suspend User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
