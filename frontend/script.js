const API = 'https://full-stack-blood-bank-management-system.onrender.com/api';
let token = localStorage.getItem('token');

const ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  DONATIONS: '/donations',
  REQUESTS: '/requests',
  INVENTORY: '/inventory'
};

// ==================== HELPER FUNCTIONS ====================
const showAlert = (message, type = 'error') => {
  // Remove existing alerts
  document.querySelectorAll('.alert').forEach(el => el.remove());
  
  const alertBox = document.createElement('div');
  alertBox.className = `alert alert-${type}`;
  alertBox.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(alertBox);
  setTimeout(() => alertBox.remove(), 3000);
};

const setLoading = (element, isLoading, loadingText = '') => {
  if (!element) return;
  
  if (isLoading) {
    element.disabled = true;
    const originalHTML = element.innerHTML;
    element.dataset.originalHtml = originalHTML;
    element.innerHTML = loadingText 
      ? `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`
      : `<i class="fas fa-spinner fa-spin"></i>`;
  } else {
    element.disabled = false;
    if (element.dataset.originalHtml) {
      element.innerHTML = element.dataset.originalHtml;
      delete element.dataset.originalHtml;
    }
  }
};

// ==================== AUTHENTICATION ====================
const handleRegister = async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  try {
    setLoading(submitBtn, true, 'Registering...');
    
    const response = await fetch(`${API}${ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        role: form.role.value,
        bloodType: form.bloodType.value
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    showAlert('Registration successful! Redirecting to login...', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  } catch (error) {
    showAlert(error.message);
  } finally {
    setLoading(submitBtn, false);
  }
};

const handleLogin = async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const loginErrorEl = document.getElementById('loginError');
  
  try {
    setLoading(submitBtn, true, 'Logging in...');
    
    if (!form.email.value || !form.password.value) {
      throw new Error('Please fill in all fields');
    }

    const response = await fetch(`${API}${ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email.value,
        password: form.password.value
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    if (!data.token) {
      throw new Error('Authentication token not received');
    }
    
    // Store user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', data.user.role);
    localStorage.setItem('userName', data.user.name);
    token = data.token;
    
    showAlert(`Welcome ${data.user.name}! Redirecting...`, 'success');
    
    setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect');
      
      let redirectPage = `${data.user.role}.html`;
      if (redirectParam && ['donor', 'recipient', 'admin'].includes(redirectParam)) {
        redirectPage = `${redirectParam}.html`;
      }
      
      window.location.href = redirectPage;
    }, 1500);
  } catch (error) {
    if (loginErrorEl) {
      loginErrorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
      loginErrorEl.style.display = 'block';
    } else {
      showAlert(error.message);
    }
  } finally {
    setLoading(submitBtn, false);
  }
};

// ==================== DONOR FUNCTIONS ====================
const handleDonation = async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  try {
    setLoading(submitBtn, true, 'Processing...');
    
    if (!form.bloodType.value) {
      throw new Error('Please select your blood type');
    }

    const response = await fetch(`${API}${ENDPOINTS.DONATIONS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bloodType: form.bloodType.value,
        donationDate: form.donationDate.value, // Make sure this is included
        units: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Donation failed');
    }

    showAlert('Thank you for your donation!', 'success');
    form.reset();
    loadInventory();
  } catch (error) {
    console.error('Donation error:', error); // Add this for debugging
    showAlert(error.message);
  } finally {
    setLoading(submitBtn, false);
  }
};

// ==================== RECIPIENT FUNCTIONS ====================
const handleRequest = async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  try {
    setLoading(submitBtn, true, 'Submitting...');
    
    if (!form.bloodType.value || !form.location.value) {
      throw new Error('Please fill all required fields');
    }

    const response = await fetch(`${API}${ENDPOINTS.REQUESTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bloodType: form.bloodType.value,
        location: form.location.value,
        urgency: 'normal'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    showAlert('Blood request submitted successfully!', 'success');
    form.reset();
    
    if (window.location.pathname.includes('admin.html')) {
      loadRequests();
    }
  } catch (error) {
    showAlert(error.message);
  } finally {
    setLoading(submitBtn, false);
  }
};

// ==================== INVENTORY FUNCTIONS ====================
const loadInventory = async () => {
  const container = document.getElementById('inventoryList');
  if (!container) return;
  
  try {
    container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading inventory...</div>';

    const response = await fetch(`${API}${ENDPOINTS.INVENTORY}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }

    const data = await response.json();
    const inventory = data.data || data;
    
    if (!inventory || inventory.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i> No inventory data</div>';
      return;
    }
    
    // Apply filter if exists
    const filter = document.getElementById('bloodTypeFilter')?.value || 'all';
    const filteredInventory = filter === 'all' 
      ? inventory 
      : inventory.filter(item => item.bloodType === filter);

    container.innerHTML = filteredInventory.map(item => `
      <div class="blood-card">
        <div class="blood-type">${item.bloodType}</div>
        <div class="stock-amount">${item.quantity} units</div>
        <div class="progress-bar">
          <div class="progress" style="width: ${Math.min(100, (item.quantity / 20) * 100)}%"></div>
        </div>
        <div class="stock-status ${item.quantity < 5 ? 'status-low' : 'status-good'}">
          ${item.quantity < 5 ? 'Low Stock' : 'In Stock'}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Inventory error:', error);
    container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        ${error.message || 'Failed to load inventory'}
        <button onclick="loadInventory()" class="btn btn-sm btn-secondary">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
  }
};

// ==================== ADMIN FUNCTIONS ====================
const loadRequests = async () => {
  const container = document.getElementById('requestList');
  if (!container) return;
  
  try {
    container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading requests...</div>';

    const response = await fetch(`${API}${ENDPOINTS.REQUESTS}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        throw new Error('Session expired. Please login again.');
      }
      throw new Error('Failed to fetch requests');
    }

    const data = await response.json();
    const requests = data.data || data;
    
    if (!requests || requests.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i> No requests found</div>';
      return;
    }

    container.innerHTML = requests.map(request => `
      <div class="request-item">
        <div class="request-info">
          <h4>${request.recipientName || 'Anonymous'}</h4>
          <p><i class="fas fa-heartbeat"></i> <strong>Blood Type:</strong> ${request.bloodType}</p>
          <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${request.location}</p>
          <p><i class="fas fa-clock"></i> <strong>Requested:</strong> ${new Date(request.createdAt).toLocaleString()}</p>
          <p><i class="fas fa-info-circle"></i> <strong>Status:</strong> 
            <span class="status-badge status-${request.status.toLowerCase()}">${request.status}</span>
          </p>
        </div>
        <div class="request-actions">
          <select class="status-select" data-id="${request.id}">
            <option value="Pending" ${request.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Approved" ${request.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="Rejected" ${request.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
          <button class="btn btn-sm btn-primary" onclick="updateStatus('${request.id}', this.previousElementSibling.value)">
            <i class="fas fa-save"></i> Update
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Requests error:', error);
    container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        ${error.message || 'Failed to load requests'}
        <button onclick="loadRequests()" class="btn btn-sm btn-secondary">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
    
    if (error.message.includes('expired')) {
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    }
  }
};

const updateStatus = async (requestId, status) => {
  try {
    const response = await fetch(`${API}${ENDPOINTS.REQUESTS}/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Update failed');
    }

    showAlert('Request status updated!', 'success');
    loadRequests();
  } catch (error) {
    showAlert(error.message);
  }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Check authentication for dashboard pages
  const currentPage = window.location.pathname;
  const userRole = localStorage.getItem('userRole');
  const storedToken = localStorage.getItem('token');

  // Redirect if not authenticated
  if (currentPage.includes('admin.html') || currentPage.includes('donor.html') || currentPage.includes('recipient.html')) {
    if (!storedToken) {
      showAlert('Please login to access this page', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }
    
    // Ensure correct dashboard access
    if (userRole && !currentPage.includes(`${userRole}.html`)) {
      showAlert(`Access denied. Redirecting to ${userRole} dashboard...`, 'error');
      setTimeout(() => {
        window.location.href = `${userRole}.html`;
      }, 1500);
      return;
    }
  }

  // Load dashboard data
  if (currentPage.includes('admin.html')) {
    loadRequests();
    loadInventory();
  } else if (currentPage.includes('donor.html') || currentPage.includes('recipient.html') || currentPage.includes('bloodInventory.html')) {
    loadInventory();
  }

  // Form event listeners
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('donationForm')?.addEventListener('submit', handleDonation);
  document.getElementById('requestForm')?.addEventListener('submit', handleRequest);

  // Inventory refresh buttons
  document.querySelectorAll('#viewInventoryBtn, [onclick="loadInventory()"]').forEach(btn => {
    btn.addEventListener('click', loadInventory);
  });

  // Blood type filter
  document.getElementById('bloodTypeFilter')?.addEventListener('change', loadInventory);

  // Password toggle
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });

  // Logout functionality
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
  });
});
