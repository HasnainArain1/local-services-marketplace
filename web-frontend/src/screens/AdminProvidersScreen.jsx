import React from "react";
import { STATUS_TONE, STATUS_LABEL } from "../theme.js";
import { apiCall } from "../api.js";
import { Button, Stamp, Table, tdStyle } from "../components.jsx";

export function AdminProvidersScreen({ providers, setProviders, token }) {
  const setStatus = async (id, status, rawId) => {
    try {
      if (token && rawId) {
        await apiCall(`/providers/${rawId}/status`, "PATCH", { status }, token);
      }
    } catch (err) {
      console.warn("Provider status API warning:", err.message);
    }
    setProviders(providers.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  return (
    <Table columns={["Provider", "Category", "City", "Status", "Actions"]}>
      {providers.map((p) => (
        <tr key={p.id}>
          <td style={tdStyle}>{p.name}</td>
          <td style={tdStyle}>{p.category}</td>
          <td style={tdStyle}>{p.city}</td>
          <td style={tdStyle}><Stamp tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status] || p.status}</Stamp></td>
          <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
            {p.status !== "active" && (
              <Button variant="ghost" style={{ padding: "5px 10px", fontSize: 12, marginRight: 8 }} onClick={() => setStatus(p.id, "active", p.rawId)}>
                Approve
              </Button>
            )}
            {p.status !== "suspended" && (
              <Button variant="danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setStatus(p.id, "suspended", p.rawId)}>
                Suspend
              </Button>
            )}
          </td>
        </tr>
      ))}
    </Table>
  );
}
