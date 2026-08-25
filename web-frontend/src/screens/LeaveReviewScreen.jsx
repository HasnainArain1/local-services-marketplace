import React, { useState } from "react";
import { C, disp, mono, sans, inputStyle } from "../theme.js";
import { apiCall } from "../api.js";
import { Card, Button, Field } from "../components.jsx";

export default function LeaveReviewScreen({ requestId, providerId, token, navigate }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiCall("/reviews/", "POST", {
        request_id: requestId,
        rating,
        comment: comment.trim() || null,
      }, token);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Card style={{ textAlign: "center", padding: "48px 28px" }}>
          <div style={{ ...disp, fontSize: 32, fontWeight: 700, color: C.amberDeep, marginBottom: 14 }}>★ ★ ★ ★ ★</div>
          <h2 style={{ ...disp, fontSize: 20, fontWeight: 600, color: C.ink, marginBottom: 8 }}>Thank you!</h2>
          <p style={{ ...sans, fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>
            Your review has been submitted. It helps other customers and improves the provider's profile.
          </p>
          <Button variant="amber" onClick={() => navigate("my-requests")}>Back to My Requests</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <button onClick={() => navigate("request-detail", { requestId })}
        style={{ all: "unset", cursor: "pointer", ...sans, fontSize: 13, color: C.muted, marginBottom: 16, display: "inline-block" }}>
        ← Back to request
      </button>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ ...mono, fontSize: 11, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Review</div>
        <h1 style={{ ...disp, fontSize: 24, fontWeight: 600, color: C.ink, margin: 0 }}>Leave a Review</h1>
      </div>

      <Card>
        {error && (
          <div style={{ ...sans, fontSize: 13, color: C.danger, background: C.dangerBg, padding: "8px 12px", borderRadius: 7, marginBottom: 14 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Field label="Star rating">
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)}
                  style={{
                    all: "unset", cursor: "pointer", fontSize: 28, padding: "4px 6px",
                    color: s <= rating ? C.amber : C.border,
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >★</button>
              ))}
            </div>
          </Field>
          <Field label="Comment (optional)" hint="Share your experience to help other customers.">
            <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="How was the service? Was the provider on time? Quality of work?" />
          </Field>
          <Button type="submit" variant="amber" disabled={loading} style={{ width: "100%", padding: "11px", marginTop: 4 }}>
            {loading ? "Submitting…" : "Submit Review"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
