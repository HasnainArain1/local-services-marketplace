import React, { useState } from "react";

const FONT_IMPORT_ID = "lsm-fonts";
if (typeof document !== "undefined" && !document.getElementById(FONT_IMPORT_ID)) {
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
}

const C = {
  ink: "#1E2A38",
  inkSoft: "#3A4A5C",
  paper: "#F5F4EF",
  card: "#FFFFFF",
  border: "#E2E0D6",
  muted: "#6B7280",
  amber: "#D98E2B",
  amberDeep: "#8A5A15",
  amberBg: "#FBEEDA",
  teal: "#2F6F68",
  tealDeep: "#1C4642",
  tealBg: "#E4F0EE",
  success: "#3F7D5C",
  successBg: "#E4F2E9",
  danger: "#B94A3D",
  dangerBg: "#F9E7E4",
};

const disp = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'IBM Plex Mono', monospace" };
const sans = { fontFamily: "'Inter', sans-serif" };

// ---------- Mock data (stands in for the backend endpoints) ----------

const initialCategories = [
  { id: "c1", name: "Plumbing" },
  { id: "c2", name: "Electrical" },
  { id: "c3", name: "House cleaning" },
  { id: "c4", name: "Appliance repair" },
];

const initialProviders = [
  { id: "p1", name: "Amir Khan", category: "Plumbing", city: "Karachi", status: "active", joined: "2026-02-11", rating: 4.8 },
  { id: "p2", name: "Sana Tariq", category: "Electrical", city: "Lahore", status: "pending", joined: "2026-06-30", rating: null },
  { id: "p3", name: "Bilal Hussain", category: "House cleaning", city: "Karachi", status: "suspended", joined: "2026-01-04", rating: 3.9 },
  { id: "p4", name: "Fatima Noor", category: "Appliance repair", city: "Islamabad", status: "active", joined: "2026-04-22", rating: 4.6 },
];

const initialRequests = [
  { id: "REQ-1042", providerId: "p1", customer: "Hassan Ali", category: "Plumbing", summary: "Leaking kitchen pipe, needs same-day fix", status: "new", quote: null, created: "2026-08-16" },
  { id: "REQ-1041", providerId: "p1", customer: "Mehwish Zafar", category: "Plumbing", summary: "Install new water heater", status: "quoted", quote: "PKR 8,500", created: "2026-08-15" },
  { id: "REQ-1039", providerId: "p1", customer: "Adeel Chaudhry", category: "Plumbing", summary: "Bathroom drain fully blocked", status: "in_progress", quote: "PKR 3,000", created: "2026-08-13" },
  { id: "REQ-1035", providerId: "p1", customer: "Rimsha Iqbal", category: "Plumbing", summary: "Replace kitchen sink fixture", status: "completed", quote: "PKR 5,200", created: "2026-08-09" },
];

const initialReviews = [
  { id: "r1", providerId: "p1", customer: "Rimsha Iqbal", rating: 5, text: "Quick, tidy, and explained everything before starting.", date: "2026-08-10" },
  { id: "r2", providerId: "p1", customer: "Umar Farooq", rating: 4, text: "Good work, arrived a little later than the window given.", date: "2026-07-28" },
  { id: "r3", providerId: "p1", customer: "Nida Sheikh", rating: 5, text: "Fixed a leak two others couldn't diagnose.", date: "2026-07-15" },
];

const currentProviderId = "p1";

// ---------- Small building blocks ----------

function Stamp({ children, tone = "amber" }) {
  const map = {
    amber: { bg: C.amberBg, fg: C.amberDeep },
    teal: { bg: C.tealBg, fg: C.tealDeep },
    success: { bg: C.successBg, fg: C.success },
    danger: { bg: C.dangerBg, fg: C.danger },
    gray: { bg: "#EDECE6", fg: C.muted },
  }[tone];
  return (
    <span
      style={{
        ...mono,
        fontSize: 11,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 4,
        background: map.bg,
        color: map.fg,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const STATUS_TONE = {
  new: "amber",
  quoted: "teal",
  in_progress: "amber",
  completed: "success",
  active: "success",
  pending: "amber",
  suspended: "danger",
};
const STATUS_LABEL = {
  new: "New",
  quoted: "Quoted",
  in_progress: "In progress",
  completed: "Completed",
  active: "Active",
  pending: "Pending review",
  suspended: "Suspended",
};

function Card({ children, style }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "20px 22px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", style, type = "button" }) {
  const base = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13.5,
    fontWeight: 600,
    padding: "9px 16px",
    borderRadius: 7,
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "opacity 0.15s",
  };
  const variants = {
    primary: { background: C.ink, color: "#fff" },
    amber: { background: C.amber, color: "#fff" },
    ghost: { background: "transparent", color: C.ink, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.danger, border: `1px solid ${C.dangerBg}` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseDown={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ ...sans, fontSize: 12.5, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>{label}</div>
      {children}
      {hint && <div style={{ ...sans, fontSize: 11.5, color: C.muted, marginTop: 4 }}>{hint}</div>}
    </label>
  );
}

const inputStyle = {
  ...sans,
  width: "100%",
  fontSize: 14,
  padding: "9px 11px",
  borderRadius: 7,
  border: `1px solid ${C.border}`,
  background: "#FCFCFA",
  boxSizing: "border-box",
  outline: "none",
};

function PageHeader({ eyebrow, title, endpoint, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
      <div>
        <div style={{ ...mono, fontSize: 11, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{eyebrow}</div>
        <h1 style={{ ...disp, fontSize: 24, fontWeight: 600, color: C.ink, margin: 0 }}>{title}</h1>
        {endpoint && (
          <div style={{ ...mono, fontSize: 12, color: C.muted, marginTop: 6 }}>
            {endpoint}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

// ---------- Provider: Onboarding form ----------

function OnboardingForm({ onCreated }) {
  const [form, setForm] = useState({ name: "", category: initialCategories[0].name, city: "", bio: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (submitted) {
    return (
      <Card style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ ...disp, fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 8 }}>Provider profile created</div>
        <div style={{ ...sans, fontSize: 13.5, color: C.muted, marginBottom: 18 }}>
          {form.name || "Your profile"} is now under review. Head to Profile management to add more detail.
        </div>
        <Button onClick={() => setSubmitted(false)}>Add another provider</Button>
      </Card>
    );
  }

  return (
    <Card style={{ maxWidth: 520 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim() || !form.city.trim()) return;
          onCreated(form);
          setSubmitted(true);
        }}
      >
        <Field label="Full name">
          <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="Amir Khan" required />
        </Field>
        <Field label="Service category">
          <select style={inputStyle} value={form.category} onChange={set("category")}>
            {initialCategories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
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
          <Button type="submit" variant="amber">Create profile</Button>
        </div>
      </form>
    </Card>
  );
}

// ---------- Provider: Profile management ----------

function ProfileManagement({ profile, setProfile }) {
  const [draft, setDraft] = useState(profile);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k) => (e) => { setDraft({ ...draft, [k]: e.target.value }); setSaved(false); };

  const regenerateBio = () => {
    setGenerating(true);
    setTimeout(() => {
      setDraft((d) => ({
        ...d,
        bio: `${d.name.split(" ")[0]} is a trusted ${d.category.toLowerCase()} specialist in ${d.city}, known for punctual, tidy work and clear pricing before every job.`,
      }));
      setGenerating(false);
    }, 900);
  };

  return (
    <Card style={{ maxWidth: 560 }}>
      <Field label="Full name">
        <input style={inputStyle} value={draft.name} onChange={set("name")} />
      </Field>
      <Field label="Service category">
        <select style={inputStyle} value={draft.category} onChange={set("category")}>
          {initialCategories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </Field>
      <Field label="City">
        <input style={inputStyle} value={draft.city} onChange={set("city")} />
      </Field>
      <Field label="Bio">
        <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={draft.bio} onChange={set("bio")} />
        <div style={{ marginTop: 8 }}>
          <Button variant="ghost" onClick={regenerateBio} style={{ fontSize: 12.5, padding: "7px 12px" }}>
            {generating ? "Regenerating…" : "Regenerate bio"}
          </Button>
        </div>
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
        {saved && <span style={{ ...sans, fontSize: 12.5, color: C.success, alignSelf: "center" }}>Saved</span>}
        <Button variant="amber" onClick={() => { setProfile(draft); setSaved(true); }}>Save changes</Button>
      </div>
    </Card>
  );
}

// ---------- Provider: Incoming requests + detail ----------

function IncomingRequests({ requests, onOpen }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {requests.map((r) => (
        <button
          key={r.id}
          onClick={() => onOpen(r.id)}
          style={{
            all: "unset",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "14px 18px",
          }}
        >
          <div style={{ ...mono, fontSize: 12.5, color: C.muted, width: 90, flexShrink: 0 }}>{r.id}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...sans, fontSize: 14, fontWeight: 600, color: C.ink }}>{r.customer}</div>
            <div style={{ ...sans, fontSize: 13, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.summary}</div>
          </div>
          <div style={{ ...sans, fontSize: 12, color: C.muted, flexShrink: 0 }}>{r.created}</div>
          <Stamp tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Stamp>
        </button>
      ))}
    </div>
  );
}

function RequestDetail({ request, onQuote, onStatusChange, onBack }) {
  const [quoteAmount, setQuoteAmount] = useState("");

  return (
    <div>
      <button onClick={onBack} style={{ all: "unset", cursor: "pointer", ...sans, fontSize: 13, color: C.muted, marginBottom: 16, display: "inline-block" }}>
        ← Back to requests
      </button>
      <Card style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ ...mono, fontSize: 12, color: C.muted }}>{request.id}</div>
            <div style={{ ...disp, fontSize: 18, fontWeight: 600, color: C.ink }}>{request.customer}</div>
          </div>
          <Stamp tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</Stamp>
        </div>
        <div style={{ ...sans, fontSize: 13.5, color: C.inkSoft, marginBottom: 18, lineHeight: 1.6 }}>{request.summary}</div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 16 }}>
          <div style={{ ...sans, fontSize: 12.5, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }}>Send a quote</div>
          {request.quote ? (
            <div style={{ ...sans, fontSize: 14, color: C.ink }}>Quote sent: <strong>{request.quote}</strong></div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="e.g. PKR 4,500" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} />
              <Button variant="amber" onClick={() => quoteAmount.trim() && onQuote(request.id, quoteAmount)}>Send quote</Button>
            </div>
          )}
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 16 }}>
          <div style={{ ...sans, fontSize: 12.5, fontWeight: 600, color: C.inkSoft, marginBottom: 10 }}>Job status</div>
          <div style={{ display: "flex", gap: 8 }}>
            {request.status === "quoted" && <Button onClick={() => onStatusChange(request.id, "in_progress")}>Start job</Button>}
            {request.status === "in_progress" && <Button onClick={() => onStatusChange(request.id, "completed")}>Mark complete</Button>}
            {(request.status === "new" || request.status === "completed") && (
              <span style={{ ...sans, fontSize: 13, color: C.muted }}>
                {request.status === "completed" ? "This job is complete." : "Send a quote to move this job forward."}
              </span>
            )}
          </div>
        </div>

        <div style={{ ...sans, fontSize: 12.5, color: C.muted, background: "#FAF9F5", border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 12px" }}>
          Messages with the customer happen in the mobile app — this view doesn't include chat.
        </div>
      </Card>
    </div>
  );
}

// ---------- Provider: Reviews ----------

function ReviewsPage({ reviews }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  const refreshSummary = () => {
    setLoading(true);
    setTimeout(() => {
      setSummary("Customers consistently praise punctuality and clear upfront pricing, with only occasional notes about arrival windows running a little late.");
      setLoading(false);
    }, 900);
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: summary || loading ? 12 : 0 }}>
          <div>
            <div style={{ ...sans, fontSize: 12.5, color: C.muted, marginBottom: 4 }}>Average rating · {reviews.length} reviews</div>
            <div style={{ ...disp, fontSize: 26, fontWeight: 600, color: C.ink }}>{avg} ★</div>
          </div>
          <Button variant="ghost" onClick={refreshSummary}>{loading ? "Refreshing…" : "Refresh summary"}</Button>
        </div>
        {summary && (
          <div style={{ ...sans, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            {summary}
          </div>
        )}
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reviews.map((r) => (
          <Card key={r.id} style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ ...sans, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{r.customer}</span>
              <span style={{ ...mono, fontSize: 12, color: C.amberDeep }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            </div>
            <div style={{ ...sans, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{r.text}</div>
            <div style={{ ...sans, fontSize: 11.5, color: C.muted, marginTop: 6 }}>{r.date}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Admin: Overview ----------

function AdminOverview({ providers, requests }) {
  const stats = [
    { label: "Active providers", value: providers.filter((p) => p.status === "active").length },
    { label: "Pending review", value: providers.filter((p) => p.status === "pending").length },
    { label: "Open requests", value: requests.filter((r) => r.status !== "completed").length },
    { label: "Completed this week", value: requests.filter((r) => r.status === "completed").length },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
      {stats.map((s) => (
        <Card key={s.label}>
          <div style={{ ...sans, fontSize: 12.5, color: C.muted, marginBottom: 8 }}>{s.label}</div>
          <div style={{ ...disp, fontSize: 30, fontWeight: 600, color: C.ink }}>{s.value}</div>
        </Card>
      ))}
    </div>
  );
}

// ---------- Admin: table shell ----------

function Table({ columns, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#FAF9F5" }}>
            {columns.map((c) => (
              <th key={c} style={{ ...sans, textAlign: "left", fontSize: 11.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.4, padding: "10px 16px", borderBottom: `1px solid ${C.border}` }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
const td = { ...sans, fontSize: 13.5, color: C.ink, padding: "12px 16px", borderBottom: `1px solid ${C.border}` };

function ManageProviders({ providers, setProviders }) {
  const setStatus = (id, status) => setProviders(providers.map((p) => (p.id === id ? { ...p, status } : p)));
  return (
    <Table columns={["Provider", "Category", "City", "Status", "Actions"]}>
      {providers.map((p) => (
        <tr key={p.id}>
          <td style={td}>{p.name}</td>
          <td style={td}>{p.category}</td>
          <td style={td}>{p.city}</td>
          <td style={td}><Stamp tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Stamp></td>
          <td style={{ ...td, whiteSpace: "nowrap" }}>
            {p.status !== "active" && <Button variant="ghost" style={{ padding: "5px 10px", fontSize: 12, marginRight: 8 }} onClick={() => setStatus(p.id, "active")}>Approve</Button>}
            {p.status !== "suspended" && <Button variant="danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setStatus(p.id, "suspended")}>Suspend</Button>}
          </td>
        </tr>
      ))}
    </Table>
  );
}

function ManageRequests({ requests, providers }) {
  const providerName = (id) => providers.find((p) => p.id === id)?.name || "—";
  return (
    <Table columns={["Request", "Provider", "Customer", "Category", "Status"]}>
      {requests.map((r) => (
        <tr key={r.id}>
          <td style={{ ...td, ...mono, fontSize: 12.5 }}>{r.id}</td>
          <td style={td}>{providerName(r.providerId)}</td>
          <td style={td}>{r.customer}</td>
          <td style={td}>{r.category}</td>
          <td style={td}><Stamp tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Stamp></td>
        </tr>
      ))}
    </Table>
  );
}

function ManageCategories({ categories, setCategories }) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);

  const add = () => {
    if (!name.trim()) return;
    setCategories([...categories, { id: `c${Date.now()}`, name: name.trim() }]);
    setName("");
  };
  const remove = (id) => setCategories(categories.filter((c) => c.id !== id));
  const save = (id) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, name: editing.name } : c)));
    setEditing(null);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, maxWidth: 420 }}>
        <input style={inputStyle} placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button variant="amber" onClick={add}>Add</Button>
      </div>
      <Table columns={["Category", "Actions"]}>
        {categories.map((c) => (
          <tr key={c.id}>
            <td style={td}>
              {editing?.id === c.id ? (
                <input style={{ ...inputStyle, maxWidth: 220 }} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              ) : (
                c.name
              )}
            </td>
            <td style={{ ...td, whiteSpace: "nowrap" }}>
              {editing?.id === c.id ? (
                <Button variant="ghost" style={{ padding: "5px 10px", fontSize: 12, marginRight: 8 }} onClick={() => save(c.id)}>Save</Button>
              ) : (
                <Button variant="ghost" style={{ padding: "5px 10px", fontSize: 12, marginRight: 8 }} onClick={() => setEditing({ id: c.id, name: c.name })}>Edit</Button>
              )}
              <Button variant="danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(c.id)}>Remove</Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

// ---------- App shell ----------

const PROVIDER_SCREENS = [
  { key: "onboarding", label: "Onboarding form", endpoint: "POST /providers" },
  { key: "profile", label: "Profile management", endpoint: "PUT /providers/{id}" },
  { key: "requests", label: "Incoming requests", endpoint: "GET /requests?provider_id=" },
  { key: "reviews", label: "Reviews", endpoint: "GET /providers/{id}/reviews" },
];
const ADMIN_SCREENS = [
  { key: "overview", label: "Overview", endpoint: "GET /admin/overview" },
  { key: "providers", label: "Manage providers", endpoint: "GET /admin/providers" },
  { key: "requestsAdmin", label: "Manage requests", endpoint: "GET /admin/requests" },
  { key: "categories", label: "Manage categories", endpoint: "POST /categories" },
];

export default function App() {
  const [role, setRole] = useState("provider");
  const [screen, setScreen] = useState("onboarding");
  const [openRequestId, setOpenRequestId] = useState(null);

  const [providers, setProviders] = useState(initialProviders);
  const [requests, setRequests] = useState(initialRequests);
  const [categories, setCategories] = useState(initialCategories);
  const [profile, setProfile] = useState({
    name: "Amir Khan", category: "Plumbing", city: "Karachi",
    bio: "Licensed plumber with 8 years of experience across residential repairs and installations.",
  });

  const switchRole = (r) => {
    setRole(r);
    setScreen(r === "provider" ? "onboarding" : "overview");
    setOpenRequestId(null);
  };

  const providerRequests = requests.filter((r) => r.providerId === currentProviderId);
  const openRequest = requests.find((r) => r.id === openRequestId);

  const sendQuote = (id, amount) => setRequests(requests.map((r) => (r.id === id ? { ...r, quote: amount, status: "quoted" } : r)));
  const changeStatus = (id, status) => setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)));

  const screens = role === "provider" ? PROVIDER_SCREENS : ADMIN_SCREENS;
  const activeMeta = screens.find((s) => s.key === screen);

  return (
    <div style={{ ...sans, background: C.paper, minHeight: 640, display: "flex", color: C.ink }}>
      <aside style={{ width: 230, background: C.ink, padding: "22px 16px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ ...disp, fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Local Service</div>
        <div style={{ ...mono, fontSize: 10.5, color: "#94A3B0", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 22 }}>Marketplace ops</div>

        <div style={{ display: "flex", background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: 3, marginBottom: 20 }}>
          {["provider", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              style={{
                all: "unset", cursor: "pointer", flex: 1, textAlign: "center",
                fontSize: 12.5, fontWeight: 600, padding: "7px 0", borderRadius: 6,
                color: role === r ? C.ink : "#C7CDD3",
                background: role === r ? "#fff" : "transparent",
              }}
            >
              {r === "provider" ? "Provider" : "Admin"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {screens.map((s) => (
            <button
              key={s.key}
              onClick={() => { setScreen(s.key); setOpenRequestId(null); }}
              style={{
                all: "unset", cursor: "pointer", fontSize: 13.5, fontWeight: 500,
                padding: "9px 10px", borderRadius: 7,
                color: screen === s.key ? "#fff" : "#AEB6BE",
                background: screen === s.key ? "rgba(217,142,43,0.22)" : "transparent",
                borderLeft: screen === s.key ? `2px solid ${C.amber}` : "2px solid transparent",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: "auto", ...sans, fontSize: 11.5, color: "#7C8894", lineHeight: 1.5, paddingTop: 20 }}>
          Signed in as {role === "provider" ? profile.name : "Admin"}
        </div>
      </aside>

      <main style={{ flex: 1, padding: "28px 34px", minWidth: 0 }}>
        {role === "provider" && screen === "onboarding" && (
          <>
            <PageHeader eyebrow="Provider" title="Onboarding form" endpoint="POST /providers" />
            <OnboardingForm onCreated={() => {}} />
          </>
        )}
        {role === "provider" && screen === "profile" && (
          <>
            <PageHeader eyebrow="Provider" title="Profile management" endpoint="PUT /providers/{id} · POST /providers/{id}/generate-bio" />
            <ProfileManagement profile={profile} setProfile={setProfile} />
          </>
        )}
        {role === "provider" && screen === "requests" && !openRequest && (
          <>
            <PageHeader eyebrow="Provider" title="Incoming requests" endpoint="GET /requests?provider_id=" />
            <IncomingRequests requests={providerRequests} onOpen={setOpenRequestId} />
          </>
        )}
        {role === "provider" && screen === "requests" && openRequest && (
          <>
            <PageHeader eyebrow="Provider" title="Request detail" endpoint="GET /requests/{id} · POST /requests/{id}/quote · PATCH /requests/{id}/status" />
            <RequestDetail request={openRequest} onQuote={sendQuote} onStatusChange={changeStatus} onBack={() => setOpenRequestId(null)} />
          </>
        )}
        {role === "provider" && screen === "reviews" && (
          <>
            <PageHeader eyebrow="Provider" title="Reviews" endpoint="GET /providers/{id}/reviews · POST /providers/{id}/summarize-reviews" />
            <ReviewsPage reviews={initialReviews} />
          </>
        )}

        {role === "admin" && screen === "overview" && (
          <>
            <PageHeader eyebrow="Admin" title="Overview" endpoint="GET /admin/overview" />
            <AdminOverview providers={providers} requests={requests} />
          </>
        )}
        {role === "admin" && screen === "providers" && (
          <>
            <PageHeader eyebrow="Admin" title="Manage providers" endpoint="GET /admin/providers · PATCH /providers/{id}/status" />
            <ManageProviders providers={providers} setProviders={setProviders} />
          </>
        )}
        {role === "admin" && screen === "requestsAdmin" && (
          <>
            <PageHeader eyebrow="Admin" title="Manage requests" endpoint="GET /admin/requests" />
            <ManageRequests requests={requests} providers={providers} />
          </>
        )}
        {role === "admin" && screen === "categories" && (
          <>
            <PageHeader eyebrow="Admin" title="Manage categories" endpoint="POST /categories · PUT /categories/{id} · DELETE /categories/{id}" />
            <ManageCategories categories={categories} setCategories={setCategories} />
          </>
        )}
      </main>
    </div>
  );
}
