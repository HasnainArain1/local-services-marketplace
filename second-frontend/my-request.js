function loadMyRequests() {
    const user = DataStore.getCurrentUser();
    const requests = DataStore.getRequests(user.id);
    
    let requestRows = requests.map(req => `
        <button class="request-row" onclick="loadPage('request-detail', {id: ${req.id}})">
            <span class="request-id">#${req.id}</span>
            <span class="request-customer">${req.customerName}</span>
            <span class="request-summary">${req.summary}</span>
            <span class="stamp ${getStatusClass(req.status)}">${req.status}</span>
            <span class="request-date">${req.date}</span>
        </button>
    `).join('');

    return `
        <div>
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Dashboard</div>
                    <h1 class="page-title">My Requests</h1>
                    <div class="page-endpoint">GET /requests?customer_id=</div>
                </div>
                <button class="btn btn-amber" onclick="loadPage('request-quote')">+ New Request</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px">
                ${requestRows || '<div class="card"><p style="color:var(--muted)">No requests yet</p></div>'}
            </div>
        </div>
    `;
}