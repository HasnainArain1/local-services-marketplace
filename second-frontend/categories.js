function loadCategoriesPage() {
    const categories = DataStore.categories;
    let catCards = categories.map(cat => `
        <div class="card">
            <div style="font-size:28px;margin-bottom:6px">${cat.icon}</div>
            <h3 style="margin:0 0 4px;font-size:18px">${cat.name}</h3>
            <p style="color:var(--muted);font-size:14px;margin:0 0 12px">${cat.providerCount} providers</p>
            <button class="btn btn-amber btn-sm" onclick="loadPage('category-detail', {id: ${cat.id}})">Explore →</button>
        </div>
    `).join('');

    return `
        <div>
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Browse</div>
                    <h1 class="page-title">All Categories</h1>
                    <div class="page-endpoint">GET /categories · Public</div>
                </div>
            </div>
            <div class="field" style="margin-bottom:24px">
                <input type="text" class="input" placeholder="Search categories..." id="categorySearch" oninput="filterCategories(this.value)">
            </div>
            <div class="stat-grid" id="categoryGrid">${catCards}</div>
        </div>
    `;
}

function filterCategories(search) {
    const cards = document.querySelectorAll('#categoryGrid .card');
    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = name.includes(search.toLowerCase()) ? 'block' : 'none';
    });
}