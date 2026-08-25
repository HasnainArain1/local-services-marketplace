import React from "react";
import { C, disp, sans } from "../theme.js";
import { Card } from "../components.jsx";

export function AdminOverviewScreen({ providers, requests, adminStats }) {
  const stats = [
    { label: "Active providers", value: adminStats?.active_providers ?? providers.filter((p) => p.status === "active").length },
    { label: "Pending review", value: providers.filter((p) => p.status === "pending").length },
    { label: "Open requests", value: adminStats?.total_requests ?? requests.filter((r) => r.status !== "completed").length },
    { label: "Completed jobs", value: adminStats?.completed_jobs ?? requests.filter((r) => r.status === "completed").length },
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
