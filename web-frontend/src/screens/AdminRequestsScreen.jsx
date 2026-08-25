import React, { useState } from "react";
import { mono, inputStyle, STATUS_TONE, STATUS_LABEL } from "../theme.js";
import { apiCall } from "../api.js";
import { Button, Stamp, Table, tdStyle } from "../components.jsx";

export function AdminRequestsScreen({ requests, providers }) {
  const providerName = (id) => providers.find((p) => p.id === id)?.name || "—";
  return (
    <Table columns={["Request", "Provider", "Customer", "Category", "Status"]}>
      {requests.map((r) => (
        <tr key={r.id}>
          <td style={{ ...tdStyle, ...mono, fontSize: 12.5 }}>
            {r.id.length > 10 ? r.id.substring(0, 8) : r.id}
          </td>
          <td style={tdStyle}>{providerName(r.providerId)}</td>
          <td style={tdStyle}>{r.customer}</td>
          <td style={tdStyle}>{r.category}</td>
          <td style={tdStyle}><Stamp tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status] || r.status}</Stamp></td>
        </tr>
      ))}
    </Table>
  );
}

export function AdminCategoriesScreen({ categories, setCategories, token }) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);

  const add = async () => {
    if (!name.trim()) return;
    const catName = name.trim();
    setName("");
    let newCat = { id: `c${Date.now()}`, name: catName };
    try {
      if (token) {
        const res = await apiCall("/categories/", "POST", { name: catName, description: `${catName} services` }, token);
        if (res && res.id) {
          newCat = { id: res.id, name: res.name };
        }
      }
    } catch (err) {
      console.warn("Category add API warning:", err.message);
    }
    setCategories([...categories, newCat]);
  };

  const remove = async (id) => {
    try {
      if (token && !id.startsWith("c")) {
        await apiCall(`/categories/${id}`, "DELETE", null, token);
      }
    } catch (err) {
      console.warn("Category delete API warning:", err.message);
    }
    setCategories(categories.filter((c) => c.id !== id));
  };

  const save = async (id) => {
    const targetName = editing.name;
    setEditing(null);
    try {
      if (token && !id.startsWith("c")) {
        await apiCall(`/categories/${id}`, "PUT", { name: targetName, description: `${targetName} services` }, token);
      }
    } catch (err) {
      console.warn("Category update API warning:", err.message);
    }
    setCategories(categories.map((c) => (c.id === id ? { ...c, name: targetName } : c)));
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
            <td style={tdStyle}>
              {editing?.id === c.id ? (
                <input style={{ ...inputStyle, maxWidth: 220 }} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              ) : (
                c.name
              )}
            </td>
            <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
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
