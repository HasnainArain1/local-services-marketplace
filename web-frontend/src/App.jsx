import React, { useState, useEffect } from "react";
import { C, disp, mono, sans } from "./theme.js";
import { apiCall } from "./api.js";
import { PageHeader } from "./components.jsx";

// Import Screens
import HomeScreen from "./screens/HomeScreen.jsx";
import CategoriesScreen from "./screens/CategoriesScreen.jsx";
import CategoryDetailScreen from "./screens/CategoryDetailScreen.jsx";
import ProviderProfileScreen from "./screens/ProviderProfileScreen.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import RequestQuoteScreen from "./screens/RequestQuoteScreen.jsx";
import { MyRequestsScreen, RequestDetailScreen } from "./screens/MyRequestsScreen.jsx";
import LeaveReviewScreen from "./screens/LeaveReviewScreen.jsx";
import ProviderOnboardingScreen from "./screens/ProviderOnboardingScreen.jsx";
import ProviderProfileManageScreen from "./screens/ProviderProfileManageScreen.jsx";
import { ProviderIncomingRequestsScreen, ProviderRequestDetailScreen } from "./screens/ProviderIncomingRequestsScreen.jsx";
import ProviderReviewsScreen from "./screens/ProviderReviewsScreen.jsx";
import { AdminOverviewScreen } from "./screens/AdminOverviewScreen.jsx";
import { AdminProvidersScreen } from "./screens/AdminProvidersScreen.jsx";
import { AdminRequestsScreen, AdminCategoriesScreen } from "./screens/AdminRequestsScreen.jsx";

// Load Google Fonts
const FONT_IMPORT_ID = "lsm-fonts";
if (typeof document !== "undefined" && !document.getElementById(FONT_IMPORT_ID)) {
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
}

// Initial Mock Data Fallbacks
const initialCategories = [
  { id: "c1", name: "Plumbing" },
  { id: "c2", name: "Electrical" },
  { id: "c3", name: "House cleaning" },
  { id: "c4", name: "Appliance repair" },
  { id: "c5", name: "AC Repair" },
  { id: "c6", name: "Tutoring" },
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

export default function App() {
  const [screen, setScreen] = useState("home");
  const [screenParams, setScreenParams] = useState({});
  const [navHistory, setNavHistory] = useState([]);

  // Auth State
  const [token, setToken] = useState(() => localStorage.getItem("lsm_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("lsm_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Provider State
  const [openProviderRequestId, setOpenProviderRequestId] = useState(null);
  const [providerProfile, setProviderProfile] = useState({
    name: "Amir Khan",
    category: "Plumbing",
    city: "Karachi",
    bio: "Licensed plumber with 8 years of experience across residential repairs and installations.",
  });
  const [realProviderId, setRealProviderId] = useState(null);

  // Master Data State
  const [categories, setCategories] = useState(initialCategories);
  const [providers, setProviders] = useState(initialProviders);
  const [requests, setRequests] = useState(initialRequests);
  const [reviews, setReviews] = useState(initialReviews);
  const [adminStats, setAdminStats] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);

  // Load Data from FastAPI
  const loadData = async () => {
    try {
      const catData = await apiCall("/categories/").catch(() => null);
      if (catData && catData.length > 0) {
        setCategories(catData.map((c) => ({ id: c.id, name: c.name, description: c.description })));
        setApiConnected(true);
      }
      if (token) {
        const meUser = await apiCall("/auth/me", "GET", null, token).catch(() => null);
        if (meUser) {
          setUser(meUser);
          localStorage.setItem("lsm_user", JSON.stringify(meUser));
        }

        const role = meUser?.role || user?.role;

        if (role === "admin") {
          const statsData = await apiCall("/admin/overview", "GET", null, token).catch(() => null);
          if (statsData) setAdminStats(statsData);
          const provData = await apiCall("/admin/providers", "GET", null, token).catch(() => null);
          if (provData && provData.length > 0) {
            setProviders(provData.map((p) => ({
              id: p.id, rawId: p.id, name: p.user?.name || p.user_name || "Provider",
              category: p.categories?.[0]?.name || "General", city: p.location || "City",
              status: p.status || "active", joined: "2026-02-11", rating: p.rating_avg || 4.8,
            })));
          }
          const reqData = await apiCall("/admin/requests", "GET", null, token).catch(() => null);
          if (reqData && reqData.length > 0) {
            setRequests(reqData.map((r) => ({
              id: r.id.substring(0, 8), rawId: r.id, providerId: r.provider_id || "p1",
              customer: r.customer?.name || "Customer", category: r.matched_category?.name || "General",
              summary: r.raw_text || "Service request", status: r.status === "submitted" ? "new" : r.status,
              quote: r.quote_amount ? `PKR ${r.quote_amount}` : null, created: r.created_at?.substring(0, 10) || "2026-08-16",
            })));
          }
        } else if (role === "provider") {
          const provList = await apiCall("/providers/").catch(() => null);
          let myProv = provList && meUser ? provList.find((p) => p.user_id === meUser.id) : null;

          // Fetch requests scoped to provider's profile (backend enforces category scoping)
          const pReqs = await apiCall(myProv ? `/requests/?provider_id=${myProv.id}` : "/requests/", "GET", null, token).catch(() => []);
          if (pReqs && Array.isArray(pReqs)) {
            setRequests(pReqs.map((r) => ({
              id: r.id.substring(0, 8),
              rawId: r.id,
              providerId: r.matched_provider_id || (myProv ? myProv.id : "p1"),
              customer: r.location ? `Customer (${r.location})` : "Customer",
              category: "Service Request",
              summary: r.raw_text || "Service request",
              status: r.status === "submitted" ? "new" : r.status,
              quote: r.quote_amount ? `PKR ${r.quote_amount.toLocaleString()}` : null,
              created: r.created_at ? r.created_at.substring(0, 10) : "Today",
            })));
          }
        }
      }
    } catch {
      setApiConnected(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [token]);

  const navigate = (target, params = {}) => {
    if (target === "back") {
      if (navHistory.length > 0) {
        const prev = navHistory[navHistory.length - 1];
        setNavHistory((h) => h.slice(0, -1));
        setScreen(prev.screen);
        setScreenParams(prev.params);
        return;
      }
      setScreen("home");
      return;
    }
    setNavHistory((h) => [...h, { screen, params: screenParams }]);
    setScreen(target);
    setScreenParams(params);
  };

  const handleAuth = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("lsm_token", newToken);
    localStorage.setItem("lsm_user", JSON.stringify(newUser));

    // Automated role-based dashboard navigation upon login
    if (newUser.role === "provider") setScreen("p-requests");
    else if (newUser.role === "admin") setScreen("a-overview");
    else setScreen("my-requests");
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("lsm_token");
    localStorage.removeItem("lsm_user");
    setScreen("home");
  };

  // Role-based Dashboard Navigation Items
  const getNavItems = () => {
    const role = user?.role;

    if (!token || !user) {
      return [
        { key: "home", label: "Home" },
        { key: "categories", label: "Browse Categories" },
        { key: "request-quote", label: "Request a Quote" },
        { key: "login", label: "Sign In / Sign Up" },
      ];
    }

    if (role === "customer") {
      return [
        { key: "my-requests", label: "My Requests" },
        { key: "request-quote", label: "Submit New Request" },
        { key: "home", label: "Browse Public Site" },
      ];
    }

    if (role === "provider") {
      return [
        { key: "p-requests", label: "Incoming Requests" },
        { key: "p-profile", label: "My Profile & AI Bio" },
        { key: "p-onboarding", label: "Onboarding Details" },
        { key: "p-reviews", label: "Customer Reviews" },
        { key: "home", label: "Browse Public Site" },
      ];
    }

    if (role === "admin") {
      return [
        { key: "a-overview", label: "Overview" },
        { key: "a-providers", label: "Manage Providers" },
        { key: "a-requests", label: "Manage Requests" },
        { key: "a-categories", label: "Manage Categories" },
        { key: "home", label: "Browse Public Site" },
      ];
    }

    return [
      { key: "home", label: "Home", icon: "🏠" },
      { key: "categories", label: "Categories", icon: "📂" },
    ];
  };

  // Helper to open role dashboard directly
  const goToDashboard = () => {
    if (!user) { navigate("login"); return; }
    if (user.role === "provider") setScreen("p-requests");
    else if (user.role === "admin") setScreen("a-overview");
    else setScreen("my-requests");
  };

  const renderContent = () => {
    switch (screen) {
      // Public Screens
      case "home":
        return <HomeScreen navigate={navigate} categories={categories} />;
      case "categories":
        return <CategoriesScreen categories={categories} navigate={navigate} />;
      case "category-detail":
        return <CategoryDetailScreen categoryId={screenParams.categoryId} categoryName={screenParams.categoryName} navigate={navigate} />;
      case "provider-profile":
        return <ProviderProfileScreen providerId={screenParams.providerId} navigate={navigate} />;
      case "login":
        return <LoginScreen onAuth={handleAuth} navigate={navigate} />;
      case "request-quote":
        return <RequestQuoteScreen token={token} user={user} categories={categories} navigate={navigate} />;

      // Customer Dashboard
      case "my-requests":
        return <MyRequestsScreen token={token} user={user} navigate={navigate} />;
      case "request-detail":
        return <RequestDetailScreen requestId={screenParams.requestId} token={token} categories={categories} navigate={navigate} />;
      case "leave-review":
        return <LeaveReviewScreen requestId={screenParams.requestId} providerId={screenParams.providerId} token={token} navigate={navigate} />;

      // Provider Dashboard
      case "p-onboarding":
        return (
          <>
            <PageHeader eyebrow="Provider" title="Onboarding Form" />
            <ProviderOnboardingScreen categories={categories} onCreated={() => {}} token={token} />
          </>
        );
      case "p-profile":
        return (
          <>
            <PageHeader eyebrow="Provider" title="Profile Management" />
            <ProviderProfileManageScreen profile={providerProfile} setProfile={setProviderProfile} categories={categories} token={token} providerId={realProviderId} />
          </>
        );
      case "p-requests":
        if (openProviderRequestId) {
          const openReq = requests.find((r) => r.id === openProviderRequestId);
          return (
            <>
              <PageHeader eyebrow="Provider" title="Request Detail" />
              <ProviderRequestDetailScreen request={openReq || requests[0]} onQuote={(id, amt) => setRequests(requests.map(r => r.id === id ? {...r, quote: amt, status: "quoted"} : r))} onStatusChange={(id, st) => setRequests(requests.map(r => r.id === id ? {...r, status: st} : r))} onBack={() => setOpenProviderRequestId(null)} token={token} />
            </>
          );
        }
        return (
          <>
            <PageHeader eyebrow="Provider" title="Incoming Service Requests" />
            <ProviderIncomingRequestsScreen requests={requests} onOpen={setOpenProviderRequestId} />
          </>
        );
      case "p-reviews":
        return (
          <>
            <PageHeader eyebrow="Provider" title="Customer Reviews" />
            <ProviderReviewsScreen reviews={reviews} providerId={realProviderId} token={token} />
          </>
        );

      // Admin Dashboard
      case "a-overview":
        return (
          <>
            <PageHeader eyebrow="Admin" title="Overview Stats" />
            <AdminOverviewScreen providers={providers} requests={requests} adminStats={adminStats} />
          </>
        );
      case "a-providers":
        return (
          <>
            <PageHeader eyebrow="Admin" title="Manage Providers" />
            <AdminProvidersScreen providers={providers} setProviders={setProviders} token={token} />
          </>
        );
      case "a-requests":
        return (
          <>
            <PageHeader eyebrow="Admin" title="Manage Service Requests" />
            <AdminRequestsScreen requests={requests} providers={providers} />
          </>
        );
      case "a-categories":
        return (
          <>
            <PageHeader eyebrow="Admin" title="Manage Categories" />
            <AdminCategoriesScreen categories={categories} setCategories={setCategories} token={token} />
          </>
        );
      default:
        return <HomeScreen navigate={navigate} categories={categories} />;
    }
  };

  return (
    <div style={{ ...sans, background: C.paper, minHeight: "100vh", width: "100%", display: "flex", color: C.ink, margin: 0, padding: 0 }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: 260, background: C.ink, padding: "24px 18px", flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ cursor: "pointer" }} onClick={() => navigate("home")}>
          <div style={{ ...disp, fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Local Service</div>
          <div style={{ ...mono, fontSize: 11, color: "#94A3B0", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>Marketplace</div>
        </div>

        {/* Role Badge if signed in */}
        {token && user && (
          <div style={{ marginBottom: 16, background: "rgba(255,255,255,0.08)", padding: "10px 12px", borderRadius: 8 }}>
            <div style={{ ...mono, fontSize: 10, color: C.amber, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
              {user.role.toUpperCase()} DASHBOARD
            </div>
            <div style={{ ...sans, fontSize: 13.5, fontWeight: 600, color: "#fff", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {getNavItems().map((s) => (
            <button key={s.key} onClick={() => navigate(s.key)}
              style={{
                all: "unset", cursor: "pointer", fontSize: 13.5, fontWeight: 500,
                padding: "9.5px 12px", borderRadius: 7,
                color: screen === s.key ? "#fff" : "#AEB6BE",
                background: screen === s.key ? "rgba(217,142,43,0.22)" : "transparent",
                borderLeft: screen === s.key ? `3px solid ${C.amber}` : "3px solid transparent",
                transition: "all 0.12s",
              }}>
              {s.icon} <span style={{ marginLeft: 6 }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Account Action / Sign Out Footer */}
        <div style={{ marginTop: "auto", paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {token && user ? (
            <div>
              <button onClick={goToDashboard} style={{ all: "unset", cursor: "pointer", ...sans, fontSize: 12.5, color: C.amber, fontWeight: 600, display: "block", marginBottom: 8 }}>
                → Go to my dashboard
              </button>
              <button onClick={handleLogout} style={{ all: "unset", cursor: "pointer", ...sans, fontSize: 12, color: "#FCA5A5" }}>
                Sign out
              </button>
            </div>
          ) : (
            <div>
              <button onClick={() => navigate("login")} style={{ all: "unset", cursor: "pointer", ...sans, fontSize: 13, color: C.amber, fontWeight: 600, display: "block" }}>
                🔐 Sign In / Create Account →
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main style={{ flex: 1, padding: "28px 34px", minWidth: 0, overflowY: "auto" }}>
        {renderContent()}
      </main>
    </div>
  );
}
