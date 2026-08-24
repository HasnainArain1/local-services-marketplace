function loadReviewPage(params) {
    return `
        <div style="max-width:600px;margin:0 auto">
            <button class="back-link" onclick="loadPage('my-requests')">← Back</button>
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Review</div>
                    <h1 class="page-title">Leave a Review</h1>
                    <div class="page-endpoint">POST /reviews</div>
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
}

function setRating(rating) {
    document.getElementById('reviewRating').value = rating;
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`star${i}`).style.color = i <= rating ? 'var(--amber)' : '#ddd';
    }
}

function submitReview(e, requestId) {
    e.preventDefault();
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;
    
    DataStore.addReview(requestId, rating, comment);
    showNotification('✅ Review submitted successfully!', 'success');
    setTimeout(() => {
        loadPage('my-requests');
    }, 1000);
}