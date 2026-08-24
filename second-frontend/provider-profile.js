function loadProviderProfile(params) {
    // Find provider
    let provider = null;
    for (let cat in DataStore.providers) {
        const found = DataStore.providers[cat].find(p => p.id === parseInt(params.id));
        if (found) { provider = found; break; }
    }
    
    if (!provider) return `<div class="card"><h2>Provider not found</h2></div>`;
    
    const reviews = DataStore.providerReviews[provider.id] || [];
    let reviewList = reviews.map(r => `
        <div style="border-bottom:1px solid var(--border);padding:12px 0">
            <div class="rating-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            <p style="color:var(--ink-soft)">${r.comment}</p>
            <small style="color:var(--muted)">${r.customerName} · ${r.date}</small>
        </div>
    `).join('');

    return `
        <div>
            <button class="back-link" onclick="loadPage('category-detail', {id: 1})">← Back</button>
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Provider</div>
                    <h1 class="page-title">${provider.name}</h1>
                    <div class="page-endpoint">⭐ ${provider.rating} · ${provider.completedJobs} jobs</div>
                </div>
                <button class="btn btn-amber" onclick="loadPage('request-quote')">Request Quote</button>
            </div>
            <div style="display:grid;gap:16px;grid-template-columns:2fr 1fr">
                <div>
                    <div class="card">
                        <h3>About</h3>
                        <p>${provider.bio}</p>
                        <div style="margin-top:16px">
                            <div class="stat-label">Location</div>
                            <p>${provider.location}</p>
                        </div>
                    </div>
                    <div class="card" style="margin-top:16px">
                        <h3>Reviews (${reviews.length})</h3>
                        ${reviewList || '<p style="color:var(--muted)">No reviews yet</p>'}
                    </div>
                </div>
                <div>
                    <div class="card">
                        <h3>Quick Info</h3>
                        <div class="detail-section">
                            <div class="stat-label">Response Time</div>
                            <p>${provider.responseTime}</p>
                        </div>
                        <div class="detail-section">
                            <div class="stat-label">Completed Jobs</div>
                            <p>${provider.completedJobs}</p>
                        </div>
                        <div class="detail-section">
                            <div class="stat-label">Contact</div>
                            <p>${provider.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}