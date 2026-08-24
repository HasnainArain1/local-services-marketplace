// ============================================================
// App Router & Page Loader
// ============================================================

const pages = {};

// Load page function
function loadPage(pageName, params = {}) {
    const mainContent = document.getElementById('mainContent');
    
    // Check if page exists
    if (typeof window[pageName] === 'function') {
        mainContent.innerHTML = window[pageName](params);
    } else {
        mainContent.innerHTML = `<h2>Page not found: ${pageName}</h2>`;
    }
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
}

// Role switch
function switchRole(role) {
    if (role === 'dashboard') {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'index.html';
    }
}

// ============================================================
// Data Store (Mock API)
// ============================================================

const DataStore = {
    categories: [
        { id: 1, name: 'Plumbing', icon: '🔧', providerCount: 45, requestCount: 128 },
        { id: 2, name: 'Electrical', icon: '⚡', providerCount: 32, requestCount: 94 },
        { id: 3, name: 'Cleaning', icon: '🧹', providerCount: 68, requestCount: 203 },
        { id: 4, name: 'Painting', icon: '🎨', providerCount: 27, requestCount: 76 },
        { id: 5, name: 'Carpentry', icon: '🪚', providerCount: 19, requestCount: 52 },
        { id: 6, name: 'Gardening', icon: '🌿', providerCount: 23, requestCount: 61 }
    ],
    
    providers: {
        1: [
            { id: 1, name: 'John\'s Plumbing', location: 'Downtown', rating: 4.8, reviews: 45 },
            { id: 2, name: 'Quick Fix Plumbers', location: 'Westside', rating: 4.6, reviews: 32 },
            { id: 3, name: 'Expert Plumbing Co.', location: 'Eastside', rating: 4.9, reviews: 28 }
        ],
        2: [
            { id: 4, name: 'Sparky Electric', location: 'Downtown', rating: 4.7, reviews: 38 },
            { id: 5, name: 'Bright Lights Co.', location: 'Northside', rating: 4.5, reviews: 25 }
        ],
        3: [
            { id: 6, name: 'Clean Sweep', location: 'All Areas', rating: 4.9, reviews: 67 },
            { id: 7, name: 'Sparkle Cleaners', location: 'Southside', rating: 4.4, reviews: 42 }
        ]
    },
    
    getRequests() {
        const stored = localStorage.getItem('requests');
        if (stored) {
            return JSON.parse(stored);
        }
        // Default requests
        return [
            { id: 1, summary: 'Fix leaking pipe in kitchen', status: 'in_progress', date: '2024-01-15', customerName: 'John Doe', category: 'Plumbing', description: 'Kitchen sink pipe is leaking badly' },
            { id: 2, summary: 'Install new light fixtures', status: 'quoted', date: '2024-01-12', customerName: 'John Doe', category: 'Electrical', description: 'Need 3 new LED fixtures installed in living room' },
            { id: 3, summary: 'Deep clean entire apartment', status: 'completed', date: '2024-01-10', customerName: 'John Doe', category: 'Cleaning', description: '3 bedroom apartment needs thorough cleaning' }
        ];
    },
    
    saveRequest(request) {
        const requests = this.getRequests();
        request.id = Date.now();
        request.date = new Date().toLocaleDateString();
        requests.unshift(request);
        localStorage.setItem('requests', JSON.stringify(requests));
        return request;
    },
    
    updateRequestStatus(id, status) {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === id);
        if (index !== -1) {
            requests[index].status = status;
            localStorage.setItem('requests', JSON.stringify(requests));
            return requests[index];
        }
        return null;
    },
    
    getProvider(id) {
        return {
            id: 1,
            name: 'John\'s Plumbing',
            bio: 'Expert plumbing services with 15+ years of experience. Licensed and insured. Fast response and quality work guaranteed.',
            location: 'Downtown, NY',
            responseTime: 'Under 1 hour',
            completedJobs: 342,
            rating: 4.8,
            phone: '(555) 123-4567',
            email: 'john@plumbing.com'
        };
    },
    
    getProviderReviews(providerId) {
        return [
            { id: 1, rating: 5, comment: 'Amazing service! Fixed my leak quickly.', customerName: 'Sarah M.', date: '2 days ago' },
            { id: 2, rating: 4, comment: 'Professional and punctual. Would hire again.', customerName: 'Mike R.', date: '1 week ago' },
            { id: 3, rating: 5, comment: 'Best plumber in town! Highly recommend.', customerName: 'Emma K.', date: '2 weeks ago' }
        ];
    }
};

// ============================================================
// Page Components
// ============================================================

// ---------- HOME PAGE ----------
window.home = function() {
    const categories = DataStore.categories;
    let catCards = categories.map(cat => `
        <div class="card">
            <div style="font-size:32px;margin-bottom:8px">${cat.icon}</div>
            <h3 style="margin:0 0 4px;font-size:18px">${cat.name}</h3>
            <p style="color:var(--muted);font-size:14px;margin:0 0 12px">${cat.providerCount} providers</p>
            <button class="btn btn-ghost btn-sm" onclick="loadPage('category-detail', {id: ${cat.id}})">View All →</button>
        </div>
    `).join('');

    return `
        <div>
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Welcome to</div>
                    <h1 class="page-title">Local Service Marketplace</h1>
                    <div class="page-endpoint">Find trusted professionals in your area</div>
                </div>
                <button class="btn btn-amber" onclick="loadPage('request-quote')">Request a Quote</button>
            </div>

            <div class="stat-grid" style="margin-bottom:24px">
                <div class="card">
                    <div class="stat-label">Active Providers</div>
                    <div class="stat-value">1,247</div>
                </div>
                <div class="card">
                    <div class="stat-label">Services Completed</div>
                    <div class="stat-value">5,832</div>
                </div>
                <div class="card">
                    <div class="stat-label">Happy Customers</div>
                    <div class="stat-value">4,901</div>
                </div>
            </div>

            <h2 style="margin-bottom:16px;font-family:var(--font-display)">Popular Categories</h2>
            <div class="stat-grid">${catCards}</div>
        </div>
    `;
};

// ---------- CATEGORIES PAGE ----------
window.categories = function() {
    const categories = DataStore.categories;
    let catCards = categories.map(cat => `
        <div class="card">
            <div style="font-size:28px;margin-bottom:6px">${cat.icon}</div>
            <h3 style="margin:0 0 4px;font-size:18px">${cat.name}</h3>
            <p style="color:var(--muted);font-size:14px;margin:0 0 12px">${cat.providerCount} providers · ${cat.requestCount} requests</p>
            <button class="btn btn-amber btn-sm" onclick="loadPage('category-detail', {id: ${cat.id}})">Explore →</button>
        </div>
    `).join('');

    return `
        <div>
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Browse</div>
                    <h1 class="page-title">All Categories</h1>
                    <div class="page-endpoint">Find the right service for your needs</div>
                </div>
            </div>

            <div class="field" style="margin-bottom:24px">
                <input type="text" class="input" placeholder="Search categories..." id="categorySearch" oninput="filterCategories(this.value)">
            </div>

            <div class="stat-grid" id="categoryGrid">${catCards}</div>
        </div>
    `;
};

window.filterCategories = function(search) {
    const cards = document.querySelectorAll('#categoryGrid .card');
    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = name.includes(search.toLowerCase()) ? 'block' : 'none';
    });
};

// ---------- CATEGORY DETAIL PAGE ----------
window['category-detail'] = function(params) {
    const category = DataStore.categories.find(c => c.id === parseInt(params.id)) || { name: 'Category', icon: '📂' };
    const providers = DataStore.providers[params.id] || [];
    
    let providerList = providers.map(p => `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <h3 style="margin:0">${p.name}</h3>
                    <p style="color:var(--muted);margin:4px 0 0">${p.location} · ${p.reviews} reviews · ⭐ ${p.rating}</p>
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
                    <div class="page-endpoint">${category.providerCount || 0} providers available</div>
                </div>
                <button class="btn btn-amber" onclick="loadPage('request-quote')">Request Quote</button>
            </div>

            <div style="display:flex;flex-direction:column;gap:12px">${providerList}</div>
        </div>
    `;
};

// ---------- PROVIDER PROFILE PAGE ----------
window['provider-profile'] = function(params) {
    const provider = DataStore.getProvider(params.id);
    const reviews = DataStore.getProviderReviews(params.id);
    
    let reviewList = reviews.map(r => `
        <div style="border-bottom:1px solid var(--border);padding:12px 0">
            <div class="rating-stars" style="font-size:18px">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            <p style="color:var(--ink-soft);margin:4px 0">${r.comment}</p>
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
                    <div class="page-endpoint">⭐ ${provider.rating} · ${provider.completedJobs} jobs completed</div>
                </div>
                <button class="btn btn-amber" onclick="loadPage('request-quote')">Request Quote</button>
            </div>

            <div style="display:grid;gap:16px;grid-template-columns:2fr 1fr">
                <div>
                    <div class="card">
                        <h3>About</h3>
                        <p style="color:var(--ink-soft);line-height:1.6">${provider.bio}</p>
                        <div style="margin-top:16px">
                            <div class="stat-label">Location</div>
                            <p>${provider.location}</p>
                        </div>
                    </div>

                    <div class="card" style="margin-top:16px">
                        <h3>Reviews (${reviews.length})</h3>
                        ${reviewList}
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
                            <div class="stat-label">Rating</div>
                            <p style="color:var(--amber);font-weight:600;font-size:20px">${provider.rating} ★</p>
                        </div>
                        <div class="detail-section">
                            <div class="stat-label">Contact</div>
                            <p>${provider.phone}</p>
                            <p style="color:var(--muted);font-size:13px">${provider.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// ---------- REQUEST QUOTE PAGE ----------
window['request-quote'] = function() {
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
                    <div class="page-endpoint">Tell us what you need help with</div>
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
                        <div class="field-hint">Be as detailed as possible for better quotes</div>
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
};

window.submitRequest = function(e) {
    e.preventDefault();
    const request = {
        category: document.getElementById('requestCategory').value,
        description: document.getElementById('requestDescription').value,
        location: document.getElementById('requestLocation').value,
        preferredDate: document.getElementById('requestDate').value,
        summary: document.getElementById('requestDescription').value.substring(0, 50) + '...',
        status: 'new',
        customerName: 'Current User'
    };
    
    DataStore.saveRequest(request);
    alert('✅ Request submitted successfully!');
    window.location.href = 'dashboard.html';
};

// ---------- LOGIN PAGE ----------
window.login = function() {
    return `
        <div style="max-width:480px;margin:0 auto">
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Authentication</div>
                    <h1 class="page-title">Welcome Back</h1>
                    <div class="page-endpoint">Login to your account</div>
                </div>
            </div>

            <div class="card">
                <form onsubmit="handleLogin(event)">
                    <div class="field">
                        <label class="field-label">Email</label>
                        <input type="email" class="input" placeholder="you@example.com" id="loginEmail" required>
                    </div>

                    <div class="field">
                        <label class="field-label">Password</label>
                        <input type="password" class="input" placeholder="••••••••" id="loginPassword" required>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width:100%">Login</button>

                    <p style="margin-top:16px;color:var(--muted);text-align:center">
                        Don't have an account? 
                        <button type="button" onclick="showSignup()" style="background:none;border:none;color:var(--amber);cursor:pointer;font-weight:600">Sign Up</button>
                    </p>
                </form>
            </div>
        </div>
    `;
};

window.handleLogin = function(e) {
    e.preventDefault();
    // Demo login - redirect to dashboard
    window.location.href = 'dashboard.html';
};

window.showSignup = function() {
    // Simple signup form (in a real app, toggle between login/signup)
    alert('Sign up form - In a real app, this would toggle to signup mode');
};

// ---------- MY REQUESTS PAGE (Dashboard) ----------
window['my-requests'] = function() {
    const requests = DataStore.getRequests();
    
    let requestRows = requests.map(req => `
        <button class="request-row" onclick="loadPage('request-detail', {id: ${req.id}})">
            <span class="request-id">#${req.id}</span>
            <span class="request-customer">${req.customerName || 'You'}</span>
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
                    <div class="page-endpoint">Track all your service requests</div>
                </div>
                <button class="btn btn-amber" onclick="window.location.href='index.html?page=request-quote'">+ New Request</button>
            </div>

            <div style="display:flex;flex-direction:column;gap:12px">
                ${requestRows || '<div class="card" style="text-align:center;padding:40px"><p style="color:var(--muted);margin-bottom:16px">No requests yet</p><button class="btn btn-amber" onclick="window.location.href=\'index.html?page=request-quote\'">Create Your First Request</button></div>'}
            </div>
        </div>
    `;
};

// ---------- REQUEST DETAIL PAGE ----------
window['request-detail'] = function(params) {
    const requests = DataStore.getRequests();
    const request = requests.find(r => r.id === parseInt(params.id)) || { id: params.id, summary: 'Request not found', status: 'unknown' };
    
    return `
        <div>
            <button class="back-link" onclick="loadPage('my-requests')">← Back to Requests</button>

            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Request #${request.id}</div>
                    <h1 class="page-title">${request.summary}</h1>
                    <div class="page-endpoint">${request.category || 'Service Request'}</div>
                </div>
                <span class="stamp ${getStatusClass(request.status)}">${request.status}</span>
            </div>

            <div style="display:grid;gap:16px;grid-template-columns:2fr 1fr">
                <div>
                    <div class="card">
                        <div class="detail-section">
                            <h3 style="margin:0 0 8px">Description</h3>
                            <p style="color:var(--ink-soft);line-height:1.6">${request.description || 'No description provided'}</p>
                        </div>

                        <div class="detail-section">
                            <h3 style="margin:0 0 8px">Location</h3>
                            <p style="color:var(--ink-soft)">${request.location || 'Not specified'}</p>
                        </div>
                        
                        ${request.quote ? `
                        <div class="detail-section">
                            <h3 style="margin:0 0 8px">Quote</h3>
                            <p style="font-size:20px;font-weight:600;color:var(--amber)">$${request.quote}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div>
                    <div class="card">
                        <h3 style="margin:0 0 12px">Actions</h3>
                        
                        ${request.status === 'quoted' ? `
                        <div style="display:flex;flex-direction:column;gap:8px">
                            <button class="btn btn-amber" onclick="updateRequestStatus(${request.id}, 'accepted')">Accept Quote</button>
                        </div>
                        ` : ''}

                        ${!['completed', 'cancelled'].includes(request.status) ? `
                        <button class="btn btn-danger" onclick="updateRequestStatus(${request.id}, 'cancelled')" style="margin-top:8px;width:100%">Cancel Request</button>
                        ` : ''}

                        ${request.status === 'completed' ? `
                        <button class="btn btn-primary" onclick="loadPage('review', {id: ${request.id}})" style="margin-top:8px;width:100%">Leave a Review</button>
                        ` : ''}

                        <div class="mobile-app-note" style="margin-top:16px">
                            💬 Chat is available in the mobile app only.
                            <br>
                            <small>Open the app to message your provider.</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// ---------- REVIEW PAGE ----------
window.review = function(params) {
    return `
        <div style="max-width:600px;margin:0 auto">
            <button class="back-link" onclick="loadPage('my-requests')">← Back</button>

            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Review</div>
                    <h1 class="page-title">Leave a Review</h1>
                    <div class="page-endpoint">Share your experience</div>
                </div>
            </div>

            <div class="card">
                <form onsubmit="submitReview(event, ${params.id})">
                    <div class="field">
                        <label class="field-label">Rating</label>
                        <div class="rating-stars" style="font-size:24px" id="ratingStars">
                            ${[1,2,3,4,5].map(star => `
                                <span onclick="setRating(${star})" style="cursor:pointer;color:#ddd" id="star${star}">★</span>
                            `).join('')}
                        </div>
                        <input type="hidden" id="reviewRating" value="5">
                    </div>

                    <div class="field">
                        <label class="field-label">Comment</label>
                        <textarea class="input tall" id="reviewComment" placeholder="Share your experience..." required></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width:100%">Submit Review</button>
                </form>
            </div>
        </div>
    `;
};

window.setRating = function(rating) {
    document.getElementById('reviewRating').value = rating;
    for (let i = 1; i <= 5; i++) {
        const star = document.getElementById(`star${i}`);
        star.style.color = i <= rating ? 'var(--amber)' : '#ddd';
    }
};

window.submitReview = function(e, requestId) {
    e.preventDefault();
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;
    
    alert(`✅ Review submitted!\nRating: ${rating}★\nComment: ${comment}`);
    window.location.href = 'dashboard.html';
};

// ---------- HELPER FUNCTIONS ----------
function getStatusClass(status) {
    const map = {
        'new': 'stamp-amber',
        'quoted': 'stamp-teal',
        'in_progress': 'stamp-amber',
        'completed': 'stamp-success',
        'cancelled': 'stamp-gray',
        'accepted': 'stamp-teal'
    };
    return map[status] || 'stamp-gray';
}

// ---------- UPDATE REQUEST STATUS ----------
window.updateRequestStatus = function(id, status) {
    if (confirm(`Are you sure you want to mark this request as "${status}"?`)) {
        DataStore.updateRequestStatus(id, status);
        alert(`✅ Request updated to "${status}"`);
        loadPage('my-requests');
    }
};