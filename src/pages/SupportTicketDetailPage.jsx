import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { api, SOCKET_BASE_URL } from "../services/api";

const STATUS_OPTIONS = ["Open", "In-Progress", "Resolved", "Closed"];

export default function SupportTicketDetailPage({ token, ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const data = await api.getSupportTicketDetail(token, ticketId);
      setTicket(data.data);
    } catch (error) {
      console.error("Failed to load ticket:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, token]);

  useEffect(() => {
    const socket = io(SOCKET_BASE_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-ticket-room", ticketId);
    });

    socket.on("support:new-message", (payload) => {
      if (payload.ticketId !== ticketId) return;
      setTicket((prev) =>
        prev ? { ...prev, status: payload.status, messages: [...prev.messages, payload.message] } : prev,
      );
    });

    socket.on("support:status-changed", (payload) => {
      if (payload.ticketId !== ticketId) return;
      setTicket((prev) => (prev ? { ...prev, status: payload.status } : prev));
    });

    return () => {
      socket.emit("leave-ticket-room", ticketId);
      socket.disconnect();
    };
  }, [ticketId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages?.length]);

  const isClosed = ticket?.status === "Resolved" || ticket?.status === "Closed";

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.sendSupportMessage(token, ticketId, text.trim());
      setText("");
    } catch (error) {
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ticket.status) return;
    setStatusUpdating(true);
    try {
      await api.updateSupportTicketStatus(token, ticketId, newStatus);
    } catch (error) {
      alert(error.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner"></span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="error-message">
        <p>Ticket not found</p>
        <button onClick={onBack} className="btn-primary">
          Back to Support Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="report-details-page">
      <div className="page-header">
        <button onClick={onBack} className="btn-back">
          ← Back to Support Inbox
        </button>
        <h1 className="page-title">{ticket.issueType}</h1>
        <p className="page-subtitle">
          {ticket.name} ({ticket.userModel}) · {ticket.phone} · {ticket.supportType}
        </p>
      </div>

      <div className="action-bar">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={statusUpdating || s === ticket.status}
            className={s === ticket.status ? "btn-primary" : "btn-secondary"}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Conversation</h2>
        </div>
        <div className="card-body">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 420,
              overflowY: "auto",
              padding: "4px 2px",
              marginBottom: 16,
            }}
          >
            {ticket.messages.map((msg, i) => {
              const isOwn = msg.senderModel === "Admin";
              return (
                <div
                  key={msg._id || i}
                  style={{
                    alignSelf: isOwn ? "flex-end" : "flex-start",
                    maxWidth: "75%",
                    background: isOwn ? "#1976d2" : "#f1f5f9",
                    color: isOwn ? "#ffffff" : "#1e293b",
                    borderRadius: 14,
                    padding: "10px 14px",
                    fontSize: 13,
                    lineHeight: 1.4,
                  }}
                >
                  {!isOwn && (
                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginBottom: 2 }}>
                      {msg.senderModel}
                    </div>
                  )}
                  {msg.text}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isClosed || sending}
              placeholder={isClosed ? "This conversation is closed" : "Type a reply..."}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={isClosed || sending || !text.trim()}
              className="btn-primary"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
