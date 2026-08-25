import React, { useState, useEffect } from "react";
import { C, disp, sans } from "../theme.js";
import { apiCall } from "../api.js";
import { Card, Button, Stars, Empty } from "../components.jsx";

export default function ProviderProfileScreen({ providerId, navigate }) {
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiCall(`/providers/${providerId}`).catch(() => null),
      apiCall(`/providers/${providerId}/reviews`).catch(() => []),
    ]).then(([p, r]) => {
      setProvider(p);
      setReviews(r || []);
    }).finally(() => setLoading(false));
  }, [providerId]);

  if (loading) {
    return <Card style={{ textAlign: "center", padding: "48px" }}><div style={{ ...sans, fontSize: 14, color: C.muted }}>Loading profile…</div></Card>;
  }
  if (!provider) {
    return <Empty icon="❌" message="Provider not found." />;
  }

  const name = provider.user_name || "Provider";
  const cat = provider.categories?.[0]?.name || "General";

  return (
    <div>
      <button onClick={() => navigate("back")}
        style={{ all: "unset", cursor: "pointer", ...sans, fontSize: 13, color: C.muted, marginBottom: 16, display: "inline-block" }}>
        ← Back
      </button>

      <Card style={{ marginBottom: 16, display: "flex", gap: 20, alignItems: "flex-start", padding: "28px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
          background: `linear-gradient(135deg, ${C.tealBg}, ${C.amberBg})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          ...disp, fontSize: 28, fontWeight: 700, color: C.ink,
        }}>{name[0].toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...disp, fontSize: 22, fontWeight: 600, color: C.ink, margin: "0 0 4px" }}>{name}</h1>
          <div style={{ ...sans, fontSize: 13.5, color: C.muted, marginBottom: 6 }}>
            {cat} · {provider.location || "Pakistan"} · {provider.experience_years || 0} years experience
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Stars rating={provider.rating_avg || 0} size={16} />
            <span style={{ ...sans, fontSize: 13, color: C.inkSoft }}>
              {(provider.rating_avg || 0).toFixed(1)} ({provider.rating_count || 0} reviews)
            </span>
          </div>
          {provider.bio && (
            <div style={{ ...sans, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}>{provider.bio}</div>
          )}
          {!provider.bio && provider.raw_description && (
            <div style={{ ...sans, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}>{provider.raw_description}</div>
          )}
          {provider.strengths && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: C.successBg, borderRadius: 8 }}>
              <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: C.success, marginBottom: 4 }}>Strengths</div>
              <div style={{ ...sans, fontSize: 13, color: C.inkSoft }}>{provider.strengths}</div>
            </div>
          )}
          {provider.weaknesses && (
            <div style={{ marginTop: 8, padding: "10px 14px", background: C.dangerBg, borderRadius: 8 }}>
              <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: C.danger, marginBottom: 4 }}>Areas to improve</div>
              <div style={{ ...sans, fontSize: 13, color: C.inkSoft }}>{provider.weaknesses}</div>
            </div>
          )}
        </div>
      </Card>

      <Card style={{ marginBottom: 16, textAlign: "center", padding: "20px", background: C.amberBg, border: `1px solid ${C.amber}33` }}>
        <Button variant="amber" onClick={() => navigate("request-quote")}>Request a Quote from {name}</Button>
      </Card>

      <div style={{ marginBottom: 8 }}>
        <h2 style={{ ...disp, fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 14 }}>
          Reviews ({reviews.length})
        </h2>
      </div>
      {reviews.length === 0 ? (
        <Empty icon="💬" message="No reviews yet for this provider." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reviews.map((r) => (
            <Card key={r.id} style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ ...sans, fontSize: 13.5, fontWeight: 600, color: C.ink }}>Customer</span>
                <Stars rating={r.rating || 5} />
              </div>
              <div style={{ ...sans, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{r.comment || "No comment"}</div>
              <div style={{ ...sans, fontSize: 11.5, color: C.muted, marginTop: 6 }}>
                {r.created_at ? r.created_at.substring(0, 10) : ""}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
