function loadCategoryDetail(params) {
    const category = DataStore.categories.find(c => c.id === parseInt(params.id));
    const providers = DataStore.providers[params.id] || [];
    
    let providerList = providers.map(p => `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <h3 style="margin:0">${p.name}</h3>
                    <p style="color:var(--muted);margin:4px 0 0">${p.location} · ${p.reviewCount} reviews · ⭐ ${p.rating}</p>
                </div>
                <button class="btn btn-amber btn-sm" onclick="loadPage('provider-profile', {id: ${p.id}})">View Profile</button>
            </div>
        </div>
    `).join('');

    return `
        <div>
            <button class="back-link" onclick="loadPage('categories')">← Back to Categories</button>
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Category</div>
                    <h1 class="page-title">${category.icon} ${category.name}</h1>
                    <div class="page-endpoint">GET /categories/${category.id} · ${providers.length} providers</div>
                </div>
                <button class="btn btn-amber" onclick="loadPage('request-quote')">Request Quote</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px">${providerList}</div>
        </div>
    `;
}