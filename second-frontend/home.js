function loadHomePage() {
    // Home page ka HTML return karein
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
            <!-- ... rest of home page -->
        </div>
    `;
}