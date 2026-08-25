import React, { useState, useEffect } from "react";
import { C, disp, mono, sans, inputStyle, STATUS_TONE, STATUS_LABEL } from "../theme.js";
import { apiCall } from "../api.js";
import { Card, Button, Stamp } from "../components.jsx";

export function ProviderIncomingRequestsScreen({ requests, onOpen }) {
  if (!requests || requests.length === 0) {
    return (
      <Card style={{ textAlign: "center", padding: "36px 20px" }}>
        <div style={{ ...sans, fontSize: 14, color: C.muted }}>No incoming service requests found.</div>
      </Card>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {requests.map((r) => (
        <button
          key={r.id}
          onClick={() => onOpen(r.id)}
          style={{
            all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px",
          }}
        >
          <div style={{ ...mono, fontSize: 12.5, color: C.muted, width: 90, flexShrink: 0 }}>
            {r.id.length > 10 ? r.id.substring(0, 8) : r.id}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...sans, fontSize: 14, fontWeight: 600, color: C.ink }}>{r.customer}</div>
            <div style={{ ...sans, fontSize: 13, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.summary}</div>
          </div>
          <div style={{ ...sans, fontSize: 12, color: C.muted, flexShrink: 0 }}>{r.created}</div>
          <Stamp tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status] || r.status}</Stamp>
        </button>
      ))}
    </div>
  );
}

export function ProviderRequestDetailScreen({ request, onQuote, onStatusChange, onBack, token }) {
  const [quoteAmount, setQuoteAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const targetId = request.rawId || request.id;

  const fetchMessages = async () => {
    if (!token || !targetId) return;
    try {
      const data = await apiCall(`/requests/${targetId}/messages`, "GET", null, token);
      setMessages(data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (showChat) {
      fetchMessages();
      const timer = setInterval(fetchMessages, 3000);
      return () => clearInterval(timer);
    }
  }, [showChat, targetId]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || !token || !targetId) return;
    const text = chatInput.trim();
    setChatInput("");
    try {
      await apiCall(`/requests/${targetId}/messages`, "POST", { content: text }, token);
      fetchMessages();
    } catch {
      // ignore
    }
  };

  const handleSendQuote = async () => {
    if (!quoteAmount.trim()) return;
    setLoading(true);
    setStatusMsg("");
    const val = parseFloat(quoteAmount.replace(/[^0-9.]/g, ""));
    const numAmt = val || 5000;
    
    try {
      if (token && targetId) {
        await apiCall(`/requests/${targetId}/quote`, "POST", {
          quote_amount: numAmt,
          quote_message: `Professional Quote of PKR ${numAmt.toLocaleString()}`
        }, token);
        setStatusMsg("Quote submitted to customer successfully!");
      }
    } catch (err) {
      console.warn("Quote API warning:", err.message);
      setStatusMsg("Quote updated locally.");
    }
    
    onQuote(request.id, `PKR ${numAmt.toLocaleString()}`);
    setLoading(false);
  };

  const handleStatus = async (newStatus) => {
    setLoading(true);
    setStatusMsg("");
    try {
      if (token && targetId) {
        await apiCall(`/requests/${targetId}/status`, "PATCH", { status: newStatus }, token);
      }
    } catch (err) {
      console.warn("Status change API warning:", err.message);
    }
    onStatusChange(request.id, newStatus);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={onBack} style={{ all: "unset", cursor: "pointer", ...sans, fontSize: 13, color: C.muted, marginBottom: 16, display: "inline-block" }}>
        ← Back to requests
      </button>
      <Card style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ ...mono, fontSize: 12, color: C.muted }}>
              {request.id.length > 10 ? request.id.substring(0, 8) : request.id}
            </div>
            <div style={{ ...disp, fontSize: 18, fontWeight: 600, color: C.ink }}>{request.customer}</div>
          </div>
          <Stamp tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status] || request.status}</Stamp>
        </div>
        <div style={{ ...sans, fontSize: 13.5, color: C.inkSoft, marginBottom: 18, lineHeight: 1.6 }}>{request.summary}</div>

        {statusMsg && (
          <div style={{ ...sans, fontSize: 13, color: C.teal, marginBottom: 12, background: C.tealBg, padding: "8px 12px", borderRadius: 6 }}>
            {statusMsg}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 16 }}>
          <div style={{ ...sans, fontSize: 12.5, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }}>Send a quote</div>
          {request.quote ? (
            <div style={{ ...sans, fontSize: 14, color: C.ink }}>Quote sent: <strong>{request.quote}</strong></div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="e.g. PKR 4,500" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} />
              <Button variant="amber" onClick={handleSendQuote} disabled={loading}>
                {loading ? "Sending..." : "Send quote"}
              </Button>
            </div>
          )}
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 16 }}>
          <div style={{ ...sans, fontSize: 12.5, fontWeight: 600, color: C.inkSoft, marginBottom: 10 }}>Job status</div>
          <div style={{ display: "flex", gap: 8 }}>
            {(request.status === "quoted" || request.status === "accepted") && (
              <Button onClick={() => handleStatus("in_progress")} disabled={loading}>Start job</Button>
            )}
            {request.status === "in_progress" && (
              <Button onClick={() => handleStatus("completed")} disabled={loading}>Mark complete</Button>
            )}
            {(request.status === "new" || request.status === "submitted" || request.status === "matched" || request.status === "completed") && (
              <span style={{ ...sans, fontSize: 13, color: C.muted }}>
                {request.status === "completed" ? "This job is complete." : "Send a quote to move this job forward."}
              </span>
            )}
          </div>
        </div>

        {/* Live Web Chat Drawer */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ ...sans, fontSize: 13, fontWeight: 600, color: C.ink }}>Customer Communication</div>
            <Button variant="ghost" onClick={() => setShowChat(!showChat)}>
              {showChat ? "Hide Chat" : "💬 Open Live Chat"}
            </Button>
          </div>

          {showChat && (
            <div style={{ background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {messages.length === 0 ? (
                  <div style={{ ...sans, fontSize: 12, color: C.muted, textAlign: "center", padding: "12px 0" }}>No messages yet. Send a greeting below!</div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.sender_role === "provider" ? "flex-end" : "flex-start",
                        background: m.sender_role === "provider" ? C.teal : "#E5E7EB",
                        color: m.sender_role === "provider" ? "#FFF" : C.ink,
                        padding: "8px 12px",
                        borderRadius: 12,
                        maxWidth: "80%",
                        fontSize: 13,
                        ...sans,
                      }}
                    >
                      {m.content}
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1, fontSize: 13 }}
                  placeholder="Type message to customer..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                />
                <Button onClick={handleSendChat}>Send</Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
