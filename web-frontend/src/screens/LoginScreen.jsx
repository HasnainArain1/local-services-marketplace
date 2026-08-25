import React, { useState } from "react";
import { C, disp, mono, sans, inputStyle } from "../theme.js";
import { apiCall } from "../api.js";
import { Card, Button, Field } from "../components.jsx";

export default function LoginScreen({ onAuth, navigate }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "customer" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let res;
      if (mode === "login") {
        res = await apiCall("/auth/login", "POST", { email: form.email, password: form.password });
      } else {
        res = await apiCall("/auth/register", "POST", {
          name: form.name, email: form.email, phone: form.phone,
          password: form.password, role: form.role,
        });
      }
      if (res && res.access_token) {
        onAuth(res.access_token, res.user);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ ...mono, fontSize: 11, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Account</div>
        <h1 style={{ ...disp, fontSize: 24, fontWeight: 600, color: C.ink, margin: 0 }}>
          {mode === "login" ? "Sign in to your account" : "Create a new account"}
        </h1>
        <p style={{ ...sans, fontSize: 13.5, color: C.muted, marginTop: 6 }}>
          {mode === "login" ? "Enter your credentials to access your dashboard." : "Sign up as a customer or service provider."}
        </p>
      </div>

      <Card>
        <div style={{ display: "flex", background: C.paper, borderRadius: 8, padding: 3, marginBottom: 20 }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(null); }}
              style={{
                all: "unset", cursor: "pointer", flex: 1, textAlign: "center",
                fontSize: 13.5, fontWeight: 600, padding: "9px 0", borderRadius: 6,
                color: mode === m ? C.ink : C.muted,
                background: mode === m ? C.card : "transparent",
                transition: "all 0.15s",
              }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ ...sans, fontSize: 13, color: C.danger, background: C.dangerBg, padding: "8px 12px", borderRadius: 7, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <Field label="Full name">
                <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="Ahmed Khan" required />
              </Field>
              <Field label="Register as">
                <select style={inputStyle} value={form.role} onChange={set("role")}>
                  <option value="customer">Customer / Service Requester</option>
                  <option value="provider">Service Provider</option>
                </select>
              </Field>
            </>
          )}
          <Field label="Email">
            <input style={inputStyle} type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" required />
          </Field>
          {mode === "signup" && (
            <Field label="Phone number">
              <input style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="03001234567" required />
            </Field>
          )}
          <Field label="Password">
            <input style={inputStyle} type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required />
          </Field>
          <Button type="submit" variant="amber" disabled={loading} style={{ width: "100%", padding: "11px", marginTop: 4 }}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
