import React from "react";
import { C, disp, mono, sans, getCategoryMeta } from "../theme.js";
import { Card, Button } from "../components.jsx";

export default function HomeScreen({ navigate, categories }) {
  const featured = categories.slice(0, 6);
  return (
    <div>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.ink} 0%, #2A3F55 100%)`,
        borderRadius: 16, padding: "52px 40px", marginBottom: 28, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(196,123,30,0.12)" }} />
        <div style={{ position: "absolute", bottom: -30, left: "40%", width: 150, height: 150, borderRadius: "50%", background: "rgba(35,87,81,0.10)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 540 }}>
          <div style={{ ...mono, fontSize: 11, color: C.amber, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
            Local Services Marketplace
          </div>
          <h1 style={{ ...disp, fontSize: 32, fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.25 }}>
            Find trusted professionals for any job
          </h1>
          <p style={{ ...sans, fontSize: 15, color: "#B0BEC5", lineHeight: 1.6, margin: "0 0 24px" }}>
            Describe your problem in plain language. Our AI matches you with the right service provider instantly — AC repair, plumbing, tutoring, and more.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="amber" onClick={() => navigate("request-quote")} style={{ padding: "12px 22px", fontSize: 14 }}>
              Request a Quote
            </Button>
            <Button variant="ghost" onClick={() => navigate("categories")}
              style={{ padding: "12px 22px", fontSize: 14, color: "#fff", borderColor: "rgba(255,255,255,0.25)" }}>
              Browse Services
            </Button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ ...disp, fontSize: 20, fontWeight: 600, color: C.ink, marginBottom: 16 }}>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { step: "01", title: "Describe your problem", text: "Type what you need in your own words" },
            { step: "02", title: "AI matches you", text: "Our system finds the right category & provider" },
            { step: "03", title: "Get a quote", text: "Provider sends you a price — no obligation" },
            { step: "04", title: "Job done & review", text: "Pay cash, leave a review when complete" },
          ].map((s) => (
            <Card key={s.step} style={{ textAlign: "center", padding: "24px 18px" }}>
              <div style={{
                ...mono, fontSize: 14, fontWeight: 700, color: C.amber, background: C.amberBg,
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>{s.step}</div>
              <div style={{ ...sans, fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{s.title}</div>
              <div style={{ ...sans, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{s.text}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured categories */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ ...disp, fontSize: 20, fontWeight: 600, color: C.ink, margin: 0 }}>Popular services</h2>
          <Button variant="ghost" onClick={() => navigate("categories")} style={{ fontSize: 12.5, padding: "7px 14px" }}>
            View all →
          </Button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {featured.map((cat) => {
            const meta = getCategoryMeta(cat.name);
            return (
              <Card key={cat.id} onClick={() => navigate("category-detail", { categoryId: cat.id, categoryName: cat.name })}
                style={{ padding: "20px 16px", textAlign: "center" }}>
                <div style={{ ...disp, fontSize: 14, fontWeight: 700, color: C.tealDeep, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  {cat.name}
                </div>
                <div style={{ ...sans, fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
                  {meta.desc.substring(0, 60)}…
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <Card style={{
        background: `linear-gradient(135deg, ${C.tealBg} 0%, #F0F7F6 100%)`,
        border: `1px solid ${C.teal}33`, textAlign: "center", padding: "36px 24px",
      }}>
        <div style={{ ...disp, fontSize: 20, fontWeight: 600, color: C.tealDeep, marginBottom: 8 }}>
          Ready to get started?
        </div>
        <div style={{ ...sans, fontSize: 14, color: C.inkSoft, marginBottom: 18, lineHeight: 1.5 }}>
          Submit your first request — it's free, no obligation, and takes 30 seconds.
        </div>
        <Button variant="teal" onClick={() => navigate("request-quote")} style={{ padding: "11px 28px" }}>
          Request a Quote
        </Button>
      </Card>
    </div>
  );
}
