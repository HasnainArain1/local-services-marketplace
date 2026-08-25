import React, { useState, useEffect } from "react";
import { C, disp, sans, inputStyle } from "../theme.js";
import { apiCall } from "../api.js";
import { Card, Button, Field } from "../components.jsx";

export default function ProviderOnboardingScreen({ categories, onCreated, token }) {
  const [form, setForm] = useState({ name: "", categoryId: categories[0]?.id || "", city: "", bio: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingProfileId, setExistingProfileId] = useState(null);

  useEffect(() => {
    if (categories.length > 0 && !form.categoryId) {
      setForm((f) => ({ ...f, categoryId: categories[0].id }));
    }
  }, [categories]);

  // Check if provider already has a profile on mount
  useEffect(() => {
    if (token) {
      apiCall("/auth/me", "GET", null, token).then(async (user) => {
        if (user) {
          const provList = await apiCall("/providers/", "GET", null, token).catch(() => []);
          const myProv = (provList || []).find((p) => p.user_id === user.id);
          if (myProv) {
            setExistingProfileId(myProv.id);
            setForm({
              name: user.name || "",
              categoryId: myProv.categories?.[0]?.id || categories[0]?.id || "",
              city: myProv.location || "",
              bio: myProv.raw_description || "",
            });
          }
        }
      }).catch(() => {});
    }
  }, [token]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.city.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (token) {
        const payload = {
          location: form.city,
          experience_years: 3,
          raw_description: form.bio || `Professional service provider in ${form.city}`,
          category_ids: form.categoryId ? [form.categoryId] : [],
        };

        if (existingProfileId) {
          // Update existing profile
          await apiCall(`/providers/${existingProfileId}`, "PUT", payload, token);
        } else {
          // Create new profile
          await apiCall("/providers/", "POST", payload, token);
        }
      }
      onCreated(form);
      setSubmitted(true);
    } catch (err) {
      if (err.message && err.message.includes("already exists")) {
        // Profile already exists — try update instead
        setError("Profile already exists. Updating...");
        try {
          const provList = await apiCall("/providers/", "GET", null, token).catch(() => []);
          const me = await apiCall("/auth/me", "GET", null, token);
          const myProv = (provList || []).find((p) => p.user_id === me.id);
          if (myProv) {
            await apiCall(`/providers/${myProv.id}`, "PUT", {
              location: form.city,
              experience_years: 3,
              raw_description: form.bio || `Professional service provider in ${form.city}`,
              category_ids: form.categoryId ? [form.categoryId] : [],
            }, token);
            setError(null);
            onCreated(form);
            setSubmitted(true);
          }
        } catch {
          setError("Could not update profile. Please try again.");
        }
      } else {
        setError(err.message || "Failed to save profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ ...disp, fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 8 }}>Provider profile saved!</div>
        <div style={{ ...sans, fontSize: 13.5, color: C.muted, marginBottom: 18 }}>
          Your profile with {form.city} as your location is now active. You will receive requests matching your selected category.
        </div>
        <Button onClick={() => setSubmitted(false)}>Edit Profile</Button>
      </Card>
    );
  }

  return (
    <Card style={{ maxWidth: 520 }}>
      {error && <div style={{ ...sans, fontSize: 13, color: C.danger, marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <Field label="Full name">
          <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="Amir Khan" />
        </Field>
        <Field label="Service category">
          <select style={inputStyle} value={form.categoryId} onChange={set("categoryId")}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="City">
          <input style={inputStyle} value={form.city} onChange={set("city")} placeholder="Karachi" required />
        </Field>
        <Field label="Short bio" hint="You can generate this automatically from Profile management after onboarding.">
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.bio} onChange={set("bio")} placeholder="A few lines about your experience" />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          <Button type="submit" variant="amber" disabled={loading}>
            {loading ? "Saving..." : (existingProfileId ? "Update Profile" : "Create Profile")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
