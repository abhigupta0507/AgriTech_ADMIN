import { useState } from "react";
import { api } from "../../services/api";

function StatusBadge({ status }) {
  const className =
    status === "verified" ? "badge-verified" : status === "rejected" ? "badge-rejected" : "badge-pending";

  return <span className={`badge ${className}`}>{status}</span>;
}

function DocumentLink({ href, label }) {
  if (!href) return null;

  return (
    <div className="detail-item document-item">
      <div className="detail-label">{label}</div>
      <a href={href} target="_blank" rel="noreferrer" className="btn-doc-link">
        View
      </a>
    </div>
  );
}

export default function EmployeeDetailModal({ token, employee, onClose, onVerified }) {
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!employee) return null;

  const handleVerify = async (actionType) => {
    if (actionType === "reject" && !rejectionReason) {
      alert("Please provide a rejection reason");
      return;
    }

    setLoading(true);
    try {
      await api.verifyEmployee(token, employee._id, actionType, notes, rejectionReason);
      alert(`Employee ${actionType === "verify" ? "verified" : "rejected"} successfully`);
      onVerified();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasDocuments =
    employee.documents?.idProof ||
    employee.documents?.addressProof ||
    employee.documents?.employmentLetter ||
    employee.documents?.qualificationCertificate;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Employee Details</h2>
          <button className="btn-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Phone Number</div>
              <div className="detail-value">{employee.phone}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Name</div>
              <div className="detail-value">{employee.name || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Email</div>
              <div className="detail-value">{employee.email || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Designation</div>
              <div className="detail-value">{employee.designation || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Department</div>
              <div className="detail-value">{employee.department}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value">
                <StatusBadge status={employee.verificationStatus} />
              </div>
            </div>
          </div>

          {employee.homeAddress && (
            <div className="detail-item detail-spacing">
              <div className="detail-label">Home Address</div>
              <div className="detail-value">{employee.homeAddress}</div>
            </div>
          )}

          {employee.accountNumber && (
            <div className="account-grid detail-spacing">
              <div className="detail-item">
                <div className="detail-label">Account Number</div>
                <div className="detail-value">{employee.accountNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">IFSC Code</div>
                <div className="detail-value">{employee.IFSCCode}</div>
              </div>
            </div>
          )}

          <div className="detail-spacing">
            <h3 className="section-title">Uploaded Documents</h3>
            {hasDocuments ? (
              <div className="documents-grid">
                <DocumentLink href={employee.documents?.idProof} label="ID Proof" />
                <DocumentLink href={employee.documents?.addressProof} label="Address Proof" />
                <DocumentLink href={employee.documents?.employmentLetter} label="Employment Letter" />
                <DocumentLink href={employee.documents?.qualificationCertificate} label="Qualification Certificate" />
              </div>
            ) : (
              <div className="empty-inline">No documents uploaded yet</div>
            )}
          </div>

          {employee.profileComplete && employee.verificationStatus === "pending" && (
            <div className="verification-box detail-spacing">
              <h3 className="section-title">Verification Actions</h3>
              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="textarea"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any notes about this verification..."
                />
              </div>

              {action === "reject" && (
                <div className="form-group">
                  <label className="form-label">Rejection Reason *</label>
                  <textarea
                    className="textarea"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Please provide a clear reason for rejection..."
                  />
                </div>
              )}

              <div className="action-row">
                <button
                  className="btn-success"
                  type="button"
                  onClick={() => {
                    setAction("verify");
                    handleVerify("verify");
                  }}
                  disabled={loading}
                >
                  Verify Employee
                </button>
                <button
                  className="btn-danger"
                  type="button"
                  onClick={() => {
                    setAction("reject");
                    if (rejectionReason) handleVerify("reject");
                  }}
                  disabled={loading}
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
