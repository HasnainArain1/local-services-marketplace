import React, { useState, useEffect } from "react";
import { C, disp, mono, sans, getCategoryMeta } from "../theme.js";
import { apiCall } from "../api.js";
import { Card, Button, Stars, Empty } from "../components.jsx";

export default function CategoryDetailScreen({ categoryId, categoryName, navigate }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const meta = getCategoryMeta(categoryName);

  useEffect(() => {
    setLoading(true);
    apiCall(`/providers/?category_id=${categoryId}`)
      .then((data) => setProviders(data || []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, [categoryId]);

  return (
    <div>
      <button onClick={() => navigate("categories")}
        style={{ all: "unset", cursor: "pointer", ...sans, fontSize: 13, color: C.muted, marginBottom: 16, display: "inline-block" }}>
        ← Back to categories
      </button>

      <Card style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 18, padding: "24px" }}>
        <div style={{ fontSize: 48 }}>{meta.icon}</div>
        <div>
          <h1 style={{ ...disp, fontSize: 22, fontWeight: 600, color: C.ink, margin: "0 0 4px" }}>{categoryName}</h1>
          <div style={{ ...sans, fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>{meta.desc}</div>
          <div style={{ ...mono, fontSize: 12, color: C.amber, marginTop: 6 }}>
            {loading ? "Loading..." : `${providers.length} provider${providers.length !== 1 ? "s" : ""} available`}
          </div>
        </div>
      </Card>

      {loading ? (
        <Card style={{ textAlign: "center", padding: "36px" }}>
          <div style={{ ...sans, fontSize: 14, color: C.muted }}>Loading providers…</div>
        </Card>
      ) : providers.length === 0 ? (
        <Empty icon="👷" message="No providers found in this category yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {providers.map((p) => (
            <Card key={p.id} onClick={() => navigate("provider-profile", { providerId: p.id })}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${C.tealBg}, ${C.amberBg})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                ...disp, fontSize: 18, fontWeight: 700, color: C.ink, flexShrink: 0,
              }}>
                {(p.user_name || "P")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...sans, fontSize: 15, fontWeight: 600, color: C.ink }}>{p.user_name || "Provider"}</div>
                <div style={{ ...sans, fontSize: 13, color: C.muted }}>
                  {p.location || "Pakistan"} · {p.experience_years || 0} yrs experience
                </div>
                {p.bio && (
                  <div style={{ ...sans, fontSize: 12.5, color: C.inkSoft, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.bio}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <Stars rating={p.rating_avg || 0} />
                <div style={{ ...sans, fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                  {p.rating_count || 0} reviews
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card style={{ marginTop: 20, textAlign: "center", padding: "28px", background: C.amberBg, border: `1px solid ${C.amber}33` }}>
        <div style={{ ...sans, fontSize: 14, fontWeight: 600, color: C.amberDeep, marginBottom: 8 }}>
          Need {categoryName.toLowerCase()} help?
        </div>
        <Button variant="amber" onClick={() => navigate("request-quote")}>Request a Quote</Button>
      </Card>
    </div>
  );
}
