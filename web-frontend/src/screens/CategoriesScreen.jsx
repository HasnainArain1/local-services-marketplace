import React from "react";
import { C, disp, mono, sans, getCategoryMeta } from "../theme.js";
import { Card } from "../components.jsx";

export default function CategoriesScreen({ categories, navigate }) {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ ...mono, fontSize: 11, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Browse</div>
        <h1 style={{ ...disp, fontSize: 24, fontWeight: 600, color: C.ink, margin: 0 }}>Service Categories</h1>
        <p style={{ ...sans, fontSize: 14, color: C.muted, marginTop: 6 }}>
          Choose a category to see available service providers near you.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {categories.map((cat) => {
          const meta = getCategoryMeta(cat.name);
          return (
            <Card key={cat.id} onClick={() => navigate("category-detail", { categoryId: cat.id, categoryName: cat.name })}
              style={{ padding: "24px 20px" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{meta.icon}</div>
              <div style={{ ...sans, fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{cat.name}</div>
              <div style={{ ...sans, fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{meta.desc}</div>
              <div style={{ ...sans, fontSize: 12.5, color: C.amber, fontWeight: 600, marginTop: 12 }}>
                View providers →
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
