import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { api, SOCKET_BASE_URL } from "../services/api";

const STATUS_TABS = ["", "Open", "In-Progress", "Resolved", "Closed"];

const STATUS_BADGE = {
  Open: "badge-info",
  "In-Progress": "badge-warning",
  Resolved: "badge-success",
  Closed: "badge-secondary",
};

export default function SupportPage({ token }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const socketRef = useRef(null);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (status) params.status = status;
      const data = await api.getSupportTickets(token, params);
      setTickets(data.tickets || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to load support tickets:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status, page]);

  useEffect(() => {
    const socket = io(SOCKET_BASE_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("support:new-ticket", (ticket) => {
      setTickets((prev) => (page === 1 && (!status || ticket.status === status) ? [ticket, ...prev] : prev));
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const openTicket = (ticketId) => {
    window.location.hash = `support-${ticketId}`;
  };

  if (loading && !tickets.length) {
    return (
      <div className="loading">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">Support Inbox</h1>
        <p className="page-subtitle">Chat with farmers, vendors and buyers to resolve their issues</p>
      </div>

      <div className="filters-section">
        {STATUS_TABS.map((s) => (
          <button
            key={s || "all"}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={status === s ? "btn-primary" : "btn-secondary"}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Tickets</h2>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                    No support tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <code className="report-id">{ticket._id.slice(-8)}</code>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-name">{ticket.name}</div>
                        <div className="user-phone">{ticket.phone}</div>
                        <span className="badge badge-secondary">{ticket.userModel}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-light">{ticket.supportType}</span>
                    </td>
                    <td>{ticket.issueType}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[ticket.status] || "badge-secondary"}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>{formatDate(ticket.updatedAt)}</td>
                    <td>
                      <a
                        href={`#support-${ticket._id}`}
                        className="btn-link"
                        onClick={(e) => {
                          e.preventDefault();
                          openTicket(ticket._id);
                        }}
                      >
                        Open →
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pagination.pages}
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
