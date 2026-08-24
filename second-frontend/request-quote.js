function loadRequestQuote() {
    const categories = DataStore.categories;
    let catOptions = categories.map(cat => `
        <option value="${cat.id}">${cat.name}</option>
    `).join('');

    return `
        <div style="max-width:600px;margin:0 auto">
            <button class="back-link" onclick="loadPage('home')">← Back to Home</button>
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Get Started</div>
                    <h1 class="page-title">Request a Quote</h1>
                    <div class="page-endpoint">POST /requests · Customer</div>
                </div>
            </div>
            <div class="card">
                <form onsubmit="submitRequest(event)">
                    <div class="field">
                        <label class="field-label">Category</label>
                        <select class="input" id="requestCategory" required>
                            <option value="">Select a category...</option>
                            ${catOptions}
                        </select>
                    </div>
                    <div class="field">
                        <label class="field-label">Description</label>
                        <textarea class="input tall" id="requestDescription" placeholder="Describe what you need help with..." required></textarea>
                    </div>
                    <div class="field">
                        <label class="field-label">Location</label>
                        <input type="text" class="input" id="requestLocation" placeholder="Your location" required>
                    </div>
                    <div class="field">
                        <label class="field-label">Preferred Date</label>
                        <input type="date" class="input" id="requestDate" required>
                    </div>
                    <button type="submit" class="btn btn-amber" style="width:100%">Submit Request</button>
                </form>
            </div>
        </div>
    `;
}

function submitRequest(e) {
    e.preventDefault();
    const categoryId = document.getElementById('requestCategory').value;
    const category = DataStore.categories.find(c => c.id === parseInt(categoryId));
    
    const data = {
        categoryId: parseInt(categoryId),
        categoryName: category.name,
        description: document.getElementById('requestDescription').value,
        location: document.getElementById('requestLocation').value,
        preferredDate: document.getElementById('requestDate').value,
        summary: document.getElementById('requestDescription').value.substring(0, 50) + '...'
    };
    
    DataStore.createRequest(data);
    showNotification('✅ Request submitted successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}