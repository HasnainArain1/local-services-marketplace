import React, { useState, useEffect } from "react";
import { C, disp, mono, sans, STATUS_TONE, STATUS_LABEL } from "../theme.js";
import { apiCall } from "../api.js";
import { Card, Button, Stamp, Empty } from "../components.jsx";

const STATUS_STEPS = ["submitted", "matched", "quoted", "accepted", "in_progress", "completed"];

export function MyRequestsScreen({ token, user, navigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;
    setLoading(true);
    apiCall(`/requests/?customer_id=${user.id}`, "GET", null, token)
      .then((data) => setRequests(data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) return;
    const interval = setInterval(() => {
      apiCall(`/requests/?customer_id=${user.id}`, "GET", null, token)
        .then((data) => setRequests(data || []))
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [token, user]);

  if (loading) {
    return <Card style={{ textAlign: "center", padding: "48px" }}><div style={{ ...sans, fontSize: 14, color: C.muted }}>Loading requests...</div></Card>;
  }

  if (requests.length === 0) {
    return (
      <div>
        <Empty message="You haven't submitted any service requests yet." />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Button variant="amber" onClick={() => navigate("request-quote")}>Submit Your First Request</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {requests.map((r) => (
        <button key={r.id || r.rawId} onClick={() => navigate("request-detail", { requestId: r.rawId || r.id })}
          style={{
            all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px",
            transition: "box-shadow 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)"}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
        >
          <div style={{ ...mono, fontSize: 12.5, color: C.muted, width: 80, flexShrink: 0 }}>
            {r.id ? String(r.id).substring(0, 8) : ""}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...sans, fontSize: 14, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.raw_text || r.summary || "Service Request"}
            </div>
            <div style={{ ...sans, fontSize: 12.5, color: C.muted, marginTop: 2 }}>
              {r.location || "Location not specified"} · {r.created_at ? String(r.created_at).substring(0, 10) : (r.created || "")}
            </div>
          </div>
          {r.quote_amount && (
            <div style={{ ...mono, fontSize: 13, color: C.tealDeep, fontWeight: 600, flexShrink: 0 }}>
              PKR {Number(r.quote_amount).toLocaleString()}
            </div>
          )}
          <Stamp tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status] || r.status}</Stamp>
        </button>
      ))}
    </div>
  );
}

class RequestDetailErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("RequestDetailScreen Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Card style={{ padding: "32px", textAlign: "center" }}>
          <div style={{ ...sans, fontSize: 15, fontWeight: 600, color: C.ink }}>Something went wrong loading request details.</div>
          <div style={{ ...mono, fontSize: 12, color: C.danger, marginTop: 8 }}>{String(this.state.error?.message)}</div>
          <Button variant="ghost" onClick={() => this.props.navigate("my-requests")} style={{ marginTop: 16 }}>Back to my requests</Button>
        </Card>
      );
    }
    return this.props.children;
  }
}

export function RequestDetailScreen(props) {
  return (
    <RequestDetailErrorBoundary navigate={props.navigate}>
      <RequestDetailScreenContent {...props} />
    </RequestDetailErrorBoundary>
  );
}

function RequestDetailScreenContent({ requestId, token, categories = [], navigate }) {
  const [request, setRequest] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [providerReviews, setProviderReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequest = () => {
    if (!requestId || !token) {
      setLoading(false);
      return;
    }
    apiCall(`/requests/${requestId}`, "GET", null, token)
      .then((data) => {
        if (data) setRequest(data);
      })
      .catch((err) => {
        console.error("Failed to fetch request detail:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchRequest();
    const interval = setInterval(fetchRequest, 5000);
    return () => clearInterval(interval);
  }, [requestId, token]);

  useEffect(() => {
    if (request && request.matched_provider_id) {
      apiCall(`/providers/${request.matched_provider_id}`, "GET", null, token)
        .then((data) => {
          setProviderInfo(data);
          apiCall(`/providers/${request.matched_provider_id}/reviews`, "GET", null, token)
            .then((revs) => setProviderReviews(revs || []))
            .catch(() => setProviderReviews([]));
        })
        .catch(() => setProviderInfo(null));
    }
  }, [request?.matched_provider_id, token]);

  const changeStatus = async (newStatus) => {
    setActionLoading(true);
    setError(null);
    try {
      await apiCall(`/requests/${requestId}/status`, "PATCH", { status: newStatus }, token);
      fetchRequest();
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Card style={{ textAlign: "center", padding: "48px" }}><div style={{ ...sans, fontSize: 14, color: C.muted }}>Loading request details...</div></Card>;
  }
  if (!request) {
    return (
      <Card style={{ textAlign: "center", padding: "48px" }}>
        <Empty message="Request details could not be loaded." />
        <Button variant="ghost" onClick={() => navigate("my-requests")} style={{ marginTop: 16 }}>Back to my requests</Button>
      </Card>
    );
  }

  const matchedCat = (request.matched_category_id && Array.isArray(categories)) ? categories.find((c) => c.id === request.matched_category_id) : null;
  const statusStr = typeof request.status === "string" ? request.status : (request.status?.value || "submitted");
  const currentStepIdx = STATUS_STEPS.indexOf(statusStr);

  return (
    <div>
      <button onClick={() => navigate("my-requests")}
        style={{ all: "unset", cursor: "pointer", ...sans, fontSize: 13, color: C.muted, marginBottom: 16, display: "inline-block" }}>
        ← Back to my requests
      </button>

      <Card style={{ maxWidth: 650 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ ...mono, fontSize: 12, color: C.muted }}>{request.id ? String(request.id).substring(0, 8) : ""}</div>
            <div style={{ ...disp, fontSize: 18, fontWeight: 600, color: C.ink }}>Service Request</div>
          </div>
          <Stamp tone={STATUS_TONE[statusStr] || "amber"}>{STATUS_LABEL[statusStr] || String(statusStr)}</Stamp>
        </div>

        <div style={{ ...sans, fontSize: 14, color: C.inkSoft, marginBottom: 16, lineHeight: 1.6, background: C.paper, padding: "12px 14px", borderRadius: 8 }}>
          {request.raw_text || request.summary || "Service Request"}
        </div>

        {/* Status Progress Tracker */}
        <div style={{ background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ ...sans, fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Status Progress
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const labels = { submitted: "Submitted", matched: "Matched", quoted: "Quoted", accepted: "Accepted", in_progress: "In Progress", completed: "Completed" };

              return (
                <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: isDone ? C.teal : isCurrent ? C.amber : C.paper,
                    border: `2px solid ${isDone ? C.teal : isCurrent ? C.amber : C.border}`,
                    color: isDone || isCurrent ? "#fff" : C.muted,
                    ...mono, fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 6,
                  }}>
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <div style={{ ...sans, fontSize: 11, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? C.ink : C.muted, textAlign: "center" }}>
                    {labels[step]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Location</div>
            <div style={{ ...sans, fontSize: 14, color: C.ink }}>{request.location || "N/A"}</div>
          </div>
          <div>
            <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Contact</div>
            <div style={{ ...sans, fontSize: 14, color: C.ink }}>{request.contact_number || "N/A"}</div>
          </div>
          <div>
            <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Matched Category</div>
            <div style={{ ...sans, fontSize: 14, color: C.ink }}>{matchedCat ? matchedCat.name : "AC Repair / General Service"}</div>
          </div>
          <div>
            <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Submitted</div>
            <div style={{ ...sans, fontSize: 14, color: C.ink }}>{request.created_at ? String(request.created_at).substring(0, 10) : "—"}</div>
          </div>
        </div>

        {/* Provider Profile & Reviews Card */}
        {providerInfo && (
          <div style={{ background: "#F8FAF9", border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px", marginBottom: 16 }}>
            <div style={{ ...sans, fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Provider Profile Details
            </div>
            <div style={{ ...sans, fontSize: 15, fontWeight: 700, color: C.ink }}>
              {providerInfo.user_name || providerInfo.name || "Assigned Service Professional"}
            </div>
            <div style={{ ...sans, fontSize: 13, color: C.muted, marginTop: 2 }}>
              Location: {providerInfo.location} · {providerInfo.experience_years || 0} years experience
            </div>
            {providerInfo.user_phone && (
              <div style={{ ...sans, fontSize: 13, color: C.tealDeep, fontWeight: 600, marginTop: 4 }}>
                Contact Phone: {providerInfo.user_phone}
              </div>
            )}
            <div style={{ ...sans, fontSize: 13, fontWeight: 600, color: C.amberDeep, marginTop: 6 }}>
              Rating: ★ {Number(providerInfo.rating_avg || 5.0).toFixed(1)} ({providerInfo.rating_count || providerReviews.length} reviews)
            </div>

            {providerReviews.length > 0 && (
              <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>
                  Recent Reviews
                </div>
                {providerReviews.slice(0, 2).map((rev) => (
                  <div key={rev.id} style={{ background: C.card, borderRadius: 6, padding: "8px 10px", marginBottom: 6, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 11.5, color: C.amberDeep }}>
                      <span>{"★".repeat(rev.rating || 5)}</span>
                      <span style={{ color: C.muted }}>{rev.created_at ? String(rev.created_at).substring(0, 10) : ""}</span>
                    </div>
                    {rev.comment && <div style={{ ...sans, fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>{rev.comment}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {request.quote_amount && (
          <div style={{ background: C.tealBg, border: `1px solid ${C.teal}`, borderRadius: 8, padding: "16px", marginBottom: 16 }}>
            <div style={{ ...sans, fontSize: 11, fontWeight: 700, color: C.tealDeep, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Official Quote Received
            </div>
            <div style={{ ...disp, fontSize: 24, fontWeight: 700, color: C.tealDeep, marginTop: 4 }}>
              PKR {Number(request.quote_amount).toLocaleString()}
            </div>
            {request.quote_message && (
              <div style={{ ...sans, fontSize: 13, color: C.inkSoft, marginTop: 6, fontStyle: "italic", background: "rgba(255,255,255,0.7)", padding: "8px 10px", borderRadius: 6 }}>
                "{String(request.quote_message)}"
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ ...sans, fontSize: 13, color: C.danger, background: C.dangerBg, padding: "8px 12px", borderRadius: 7, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {statusStr === "quoted" && (
            <Button variant="teal" onClick={() => changeStatus("accepted")} disabled={actionLoading}>
              {actionLoading ? "Accepting..." : "Accept Quote"}
            </Button>
          )}
          {statusStr === "completed" && (
            <Button variant="amber" onClick={() => navigate("leave-review", { requestId: request.id, providerId: request.matched_provider_id })}>
              Leave a Review
            </Button>
          )}
          {["submitted", "matched", "quoted"].includes(statusStr) && (
            <Button variant="danger" onClick={() => changeStatus("cancelled")} disabled={actionLoading}>
              Cancel Request
            </Button>
          )}
          {["accepted", "in_progress"].includes(statusStr) && (
            <span style={{ ...sans, fontSize: 13, color: C.muted, alignSelf: "center" }}>
              {statusStr === "accepted" ? "Waiting for provider to start work..." : "Work is in progress..."}
            </span>
          )}
        </div>

        <div style={{ ...sans, fontSize: 12.5, color: C.muted, background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 12px", marginTop: 16 }}>
          Direct messaging with your provider is available in the mobile application.
        </div>
      </Card>
    </div>
  );
}
