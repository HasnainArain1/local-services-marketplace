function loadLoginPage() {
    return `
        <div style="max-width:480px;margin:0 auto">
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Authentication</div>
                    <h1 class="page-title">Welcome Back</h1>
                    <div class="page-endpoint">POST /author/login</div>
                </div>
            </div>
            <div class="card">
                <form onsubmit="handleLogin(event)">
                    <div class="field">
                        <label class="field-label">Email</label>
                        <input type="email" class="input" id="loginEmail" placeholder="you@example.com" required>
                    </div>
                    <div class="field">
                        <label class="field-label">Password</label>
                        <input type="password" class="input" id="loginPassword" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Login</button>
                    <p style="margin-top:16px;color:var(--muted);text-align:center">
                        Don't have an account? 
                        <a href="#" onclick="loadPage('signup')" style="color:var(--amber);font-weight:600;text-decoration:none">Sign Up</a>
                    </p>
                </form>
            </div>
        </div>
    `;
}

function loadSignupPage() {
    return `
        <div style="max-width:480px;margin:0 auto">
            <div class="page-header">
                <div>
                    <div class="page-eyebrow">Authentication</div>
                    <h1 class="page-title">Create Account</h1>
                    <div class="page-endpoint">POST /author/register</div>
                </div>
            </div>
            <div class="card">
                <form onsubmit="handleRegister(event)">
                    <div class="field">
                        <label class="field-label">Full Name</label>
                        <input type="text" class="input" id="regName" placeholder="John Doe" required>
                    </div>
                    <div class="field">
                        <label class="field-label">Email</label>
                        <input type="email" class="input" id="regEmail" placeholder="you@example.com" required>
                    </div>
                    <div class="field">
                        <label class="field-label">Password</label>
                        <input type="password" class="input" id="regPassword" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-amber" style="width:100%">Create Account</button>
                    <p style="margin-top:16px;color:var(--muted);text-align:center">
                        Already have an account? 
                        <a href="#" onclick="loadPage('login')" style="color:var(--amber);font-weight:600;text-decoration:none">Login</a>
                    </p>
                </form>
            </div>
        </div>
    `;
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    DataStore.login(email, password);
    showNotification('✅ Login successful!', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    DataStore.register(name, email, password);
    showNotification('✅ Account created successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}
