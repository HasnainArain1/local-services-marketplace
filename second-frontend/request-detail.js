function loadRequestDetail(params) {
    const requests = DataStore.getRequests();
    const request = requests.find(r => r.id === parseInt(params.id));
    
    if (!request) {
        return `<div class="card"><h2>Request not found</h2></div>`;
    }
    
    return `
        <div>
            <button class="back-link" onclick="loadPage('my-requests')">← Back to Requests</button>
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Request #${request.id}</div>
                    <h1 class="page-title">${request.summary}</h1>
                    <div class="page-endpoint">GET /requests/${request.id}</div>
                </div>
                <span class="stamp ${getStatusClass(request.status)}">${request.status}</span>
            </div>
            <div style="display:grid;gap:16px;grid-template-columns:2fr 1fr">
                <div>
                    <div class="card">
                        <div class="detail-section">
                            <h3>Description</h3>
                            <p style="color:var(--ink-soft)">${request.description}</p>
                        </div>
                        <div class="detail-section">
                            <h3>Location</h3>
                            <p style="color:var(--ink-soft)">${request.location}</p>
                        </div>
                        ${request.quote ? `
                        <div class="detail-section">
                            <h3>Quote</h3>
                            <p style="font-size:20px;font-weight:600;color:var(--amber)">$${request.quote}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div>
                    <div class="card">
                        <h3>Actions</h3>
                        ${request.status === 'quoted' ? `
                        <button class="btn btn-amber" onclick="updateRequestStatus(${request.id}, 'accepted')">Accept Quote</button>
                        ` : ''}
                        ${!['completed', 'cancelled'].includes(request.status) ? `
                        <button class="btn btn-danger" onclick="updateRequestStatus(${request.id}, 'cancelled')" style="margin-top:8px;width:100%">Cancel Request</button>
                        ` : ''}
                        ${request.status === 'completed' ? `
                        <button class="btn btn-primary" onclick="loadPage('review', {id: ${request.id}})" style="margin-top:8px;width:100%">Leave a Review</button>
                        ` : ''}
                        <div class="mobile-app-note" style="margin-top:16px">
                            💬 Chat is available in the mobile app only.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateRequestStatus(id, status) {
    if (confirm(`Mark this request as "${status}"?`)) {
        DataStore.updateRequestStatus(id, status);
        showNotification(`✅ Request updated to "${status}"`, 'success');
        loadPage('my-requests');
    }
}