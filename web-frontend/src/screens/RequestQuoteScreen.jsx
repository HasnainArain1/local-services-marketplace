import React, { useState } from "react";
import { C, disp, mono, sans, inputStyle, getCategoryMeta } from "../theme.js";
import { apiCall } from "../api.js";
import { Card, Button, Field } from "../components.jsx";

export default function RequestQuoteScreen({ token, user, categories, navigate }) {
  const [form, setForm] = useState({ raw_text: "", location: "", contact_number: "" });
  const [submitted, setSubmitted] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (!token) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <Card style={{ padding: "48px 28px" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔐</div>
          <h2 style={{ ...disp, fontSize: 20, fontWeight: 600, color: C.ink, marginBottom: 8 }}>Sign in to request a quote</h2>
          <p style={{ ...sans, fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>
            You need an account to submit service requests. It only takes a minute.
          </p>
          <Button variant="amber" onClick={() => navigate("login")}>Sign In / Sign Up</Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.raw_text.trim() || !form.location.trim() || !form.contact_number.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall("/requests/", "POST", {
        raw_text: form.raw_text,
        location: form.location,
        contact_number: form.contact_number,
      }, token);
      setMatchResult(result);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (submitted && matchResult) {
    const catId = matchResult.matched_category_id;
    const matchedCat = catId ? categories.find((c) => c.id === catId) : null;
    const catName = matchedCat ? matchedCat.name : null;
    const meta = catName ? getCategoryMeta(catName) : null;

    return (
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <Card style={{ textAlign: "center", padding: "48px 28px" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
          <h2 style={{ ...disp, fontSize: 20, fontWeight: 600, color: C.ink, marginBottom: 8 }}>Request submitted!</h2>
          {catName ? (
            <div style={{ ...sans, fontSize: 14, color: C.inkSoft, marginBottom: 16, lineHeight: 1.6 }}>
              Our AI matched your request to <strong>{meta?.icon} {catName}</strong>. A provider will send you a quote soon.
            </div>
          ) : (
            <div style={{ ...sans, fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
              Your request has been submitted. We'll match you with a suitable provider shortly.
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Button variant="amber" onClick={() => navigate("my-requests")}>View My Requests</Button>
            <Button variant="ghost" onClick={() => { setSubmitted(false); setForm({ raw_text: "", location: "", contact_number: "" }); }}>
              Submit Another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ ...mono, fontSize: 11, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>New Request</div>
        <h1 style={{ ...disp, fontSize: 24, fontWeight: 600, color: C.ink, margin: 0 }}>Request a Quote</h1>
        <p style={{ ...sans, fontSize: 13.5, color: C.muted, marginTop: 6 }}>
          Describe your problem in plain language. Our AI will match you with the right service category and provider.
        </p>
      </div>

      <Card>
        {error && (
          <div style={{ ...sans, fontSize: 13, color: C.danger, background: C.dangerBg, padding: "8px 12px", borderRadius: 7, marginBottom: 14 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Field label="What do you need help with?" hint="Describe your problem in your own words — the AI will figure out the category.">
            <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.raw_text} onChange={set("raw_text")}
              placeholder="e.g. My AC is not cooling properly, need someone to check the gas and compressor" required />
          </Field>
          <Field label="Your location">
            <input style={inputStyle} value={form.location} onChange={set("location")} placeholder="e.g. Gulshan, Karachi" required />
          </Field>
          <Field label="Contact number">
            <input style={inputStyle} value={form.contact_number} onChange={set("contact_number")} placeholder="e.g. 03001234567" required />
          </Field>
          <Button type="submit" variant="amber" disabled={loading} style={{ width: "100%", padding: "11px", marginTop: 4 }}>
            {loading ? "Submitting…" : "Submit Request"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
