/**
 * USMAN STORE — app.js
 * "Backend" powered by localStorage (acts as a persistent JSON data store).
 * In production, replace localStorage calls with real API fetch() calls.
 */

// ===================== DATA LAYER =====================

const DB = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem('usmanstore_' + key)) || null; } 
    catch(e) { return null; }
  },
  set: (key, val) => localStorage.setItem('usmanstore_' + key, JSON.stringify(val)),
};

function initDB() {
  if (!DB.get('products')) {
    DB.set('products', [
      { id: 1, name: "The Anatomy of Melancholy", category: "books", price: 2200, seller: "Admin", sellerId: 0, description: "A rare 1921 facsimile edition of Robert Burton's masterpiece of scholarly prose. Binding intact, pages supple.", condition: "good", status: "live", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80", createdAt: Date.now() - 86400000 * 5 },
      { id: 2, name: "Brass Astrolabe Replica", category: "antiques", price: 8500, seller: "Admin", sellerId: 0, description: "Hand-cast brass astrolabe, faithfully modelled after a 16th-century Islamic original. A scholarly ornament.", condition: "new", status: "live", image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=600&q=80", createdAt: Date.now() - 86400000 * 3 },
      { id: 3, name: "Victorian Correspondence Set", category: "stationery", price: 1800, seller: "Admin", sellerId: 0, description: "Cream cotton-rag paper, wax seal, and two quill pens. For letters that deserve permanence.", condition: "new", status: "live", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80", createdAt: Date.now() - 86400000 * 2 },
      { id: 4, name: "Charcoal Study — Portrait", category: "art", price: 4500, seller: "Admin", sellerId: 0, description: "Original charcoal on 300gsm cartridge paper. A contemplative figure rendered with quiet precision.", condition: "new", status: "live", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80", createdAt: Date.now() - 86400000 },
      { id: 5, name: "Tweed Waistcoat — Heritage", category: "clothing", price: 6200, seller: "Admin", sellerId: 0, description: "Pure wool Harris Tweed, hand-stitched lining, four brass buttons. Scholar's attire, fully realised.", condition: "like-new", status: "live", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", createdAt: Date.now() },
      { id: 6, name: "Leather-Bound Journal", category: "stationery", price: 3400, seller: "Admin", sellerId: 0, description: "Full-grain leather journal, 240 pages of acid-free ivory stock, sewn binding. For thoughts worth keeping.", condition: "new", status: "live", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80", createdAt: Date.now() },
    ]);
  }
  if (!DB.get('sellers'))     DB.set('sellers', []);
  if (!DB.get('applications')) DB.set('applications', []);
  if (!DB.get('approvedCount')) DB.set('approvedCount', 0);
}

function getProducts()      { return DB.get('products') || []; }
function getSellers()       { return DB.get('sellers') || []; }
function getApplications()  { return DB.get('applications') || []; }
function saveProducts(p)    { DB.set('products', p); }
function saveSellers(s)     { DB.set('sellers', s); }
function saveApplications(a){ DB.set('applications', a); }

function nextId(arr) { return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; }

// ===================== UTILITY =====================

function formatPrice(n) { return 'PKR ' + Number(n).toLocaleString('en-PK'); }
function slugCategory(c) { const m = { books:'📚', antiques:'🏺', stationery:'✒️', art:'🖼️', clothing:'🧥', other:'🔮' }; return m[c] || '🔮'; }

const PAGE = (() => {
  const p = location.pathname.split('/').pop();
  if (p === 'seller.html')  return 'seller';
  if (p === 'admin.html')   return 'admin';
  return 'index';
})();

// ===================== NAVBAR =====================

document.addEventListener('DOMContentLoaded', () => {
  initDB();

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  if (PAGE === 'index')  initIndex();
  if (PAGE === 'seller') initSeller();
  if (PAGE === 'admin')  initAdmin();
});

// ===================== INDEX PAGE =====================

let allProducts = [];
let activeCategory = 'all';
let searchQuery = '';

function initIndex() {
  allProducts = getProducts().filter(p => p.status === 'live');
  renderProducts();
  animateStats();
  initFilters();
  initModal();
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat;
      renderProducts();
    });
  });
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderProducts();
    });
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  if (!grid) return;

  let filtered = allProducts;
  if (activeCategory !== 'all') filtered = filtered.filter(p => p.category === activeCategory);
  if (searchQuery) filtered = filtered.filter(p =>
    p.name.toLowerCase().includes(searchQuery) ||
    p.description.toLowerCase().includes(searchQuery) ||
    p.category.toLowerCase().includes(searchQuery)
  );

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');

  grid.innerHTML = filtered.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.05}s" onclick="openModal(${p.id})">
      ${p.image
        ? `<img class="product-img" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
           <div class="product-img-placeholder" style="display:none">${slugCategory(p.category)}</div>`
        : `<div class="product-img-placeholder">${slugCategory(p.category)}</div>`
      }
      <div class="product-info">
        <div class="product-category">${slugCategory(p.category)} ${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.description}</div>
        <div class="product-footer">
          <span class="product-price">${formatPrice(p.price)}</span>
          <span class="product-condition">${p.condition}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function animateStats() {
  const products = getProducts().filter(p => p.status === 'live').length;
  const sellers  = getSellers().filter(s => s.status === 'active').length;
  animateNumber('statProducts', products, 1200);
  animateNumber('statSellers',  sellers,  1000);
}

function animateNumber(id, target, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0, step = target / (duration / 16);
  const tick = () => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start);
    if (start < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ===================== MODAL =====================

function initModal() {
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
}

function openModal(productId) {
  const p = getProducts().find(x => x.id === productId);
  if (!p) return;
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    ${p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:100%;max-height:320px;object-fit:cover;display:block;filter:sepia(15%) brightness(0.9);margin-bottom:0" onerror="this.remove()"/>`
      : `<div style="height:180px;background:linear-gradient(135deg,#1e1a15,#2a2318);display:flex;align-items:center;justify-content:center;font-size:4rem">${slugCategory(p.category)}</div>`
    }
    <div style="padding:2.5rem">
      <div class="product-category">${slugCategory(p.category)} ${p.category}</div>
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.9rem;color:var(--parchment);margin:0.5rem 0 1rem">${p.name}</h2>
      <p style="color:var(--text-muted);margin-bottom:1.5rem;line-height:1.8">${p.description}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
        <span style="font-family:'Cormorant Garamond',serif;font-size:2rem;color:var(--gold-light)">${formatPrice(p.price)}</span>
        <span class="product-condition">${p.condition}</span>
      </div>
      <div style="font-size:0.82rem;color:var(--text-dim);border-top:1px solid var(--card-border);padding-top:1rem">
        Sold by <strong style="color:var(--text-muted)">${p.seller}</strong>
      </div>
    </div>
  `;
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}

// ===================== SELLER PAGE =====================

let currentStep = 1;
const sellerData = {};

function initSeller() {
  // nothing special on init
}

function validateStep(step) {
  let valid = true;
  const clear = (id) => { const el = document.getElementById('err-' + id); if(el) el.textContent = ''; };
  const error = (id, msg) => { const el = document.getElementById('err-' + id); if(el) el.textContent = msg; valid = false; };

  if (step === 1) {
    ['sellerName','sellerEmail','sellerPassword'].forEach(clear);
    const name  = document.getElementById('sellerName')?.value.trim();
    const email = document.getElementById('sellerEmail')?.value.trim();
    const pass  = document.getElementById('sellerPassword')?.value;
    if (!name)  error('sellerName', 'Name is required.');
    if (!email || !/\S+@\S+\.\S+/.test(email)) error('sellerEmail', 'Valid email required.');
    if (!pass || pass.length < 8) error('sellerPassword', 'Password must be at least 8 characters.');
  }
  if (step === 2) {
    ['productName','productPrice','productCategory','productDesc'].forEach(clear);
    const name  = document.getElementById('productName')?.value.trim();
    const price = document.getElementById('productPrice')?.value;
    const cat   = document.getElementById('productCategory')?.value;
    const desc  = document.getElementById('productDesc')?.value.trim();
    if (!name)       error('productName', 'Product name required.');
    if (!price || isNaN(price) || Number(price) <= 0) error('productPrice', 'Valid price required.');
    if (!cat)        error('productCategory', 'Please select a category.');
    if (!desc || desc.length < 20) error('productDesc', 'Please write at least 20 characters.');
  }
  return valid;
}

function nextStep(from) {
  if (!validateStep(from)) return;
  if (from === 1) {
    sellerData.name     = document.getElementById('sellerName').value.trim();
    sellerData.email    = document.getElementById('sellerEmail').value.trim();
    sellerData.password = document.getElementById('sellerPassword').value;
    sellerData.phone    = document.getElementById('sellerPhone')?.value.trim();
    sellerData.bio      = document.getElementById('sellerBio')?.value.trim();
  }
  if (from === 2) {
    sellerData.productName      = document.getElementById('productName').value.trim();
    sellerData.productPrice     = Number(document.getElementById('productPrice').value);
    sellerData.productCategory  = document.getElementById('productCategory').value;
    sellerData.productDesc      = document.getElementById('productDesc').value.trim();
    sellerData.productCondition = document.getElementById('productCondition').value;
    sellerData.productImage     = document.getElementById('productImage')?.value.trim();
    buildReview();
  }
  showStep(from + 1);
}

function prevStep(from) { showStep(from - 1); }

function showStep(n) {
  currentStep = n;
  [1,2,3].forEach(i => {
    document.getElementById(`formStep${i}`)?.classList.add('hidden');
    const ind = document.getElementById(`step${i}Indicator`);
    if (ind) { ind.classList.remove('active','done'); if (i < n) ind.classList.add('done'); }
  });
  const target = document.getElementById(`formStep${n}`);
  if (target) target.classList.remove('hidden');
  const cur = document.getElementById(`step${n}Indicator`);
  if (cur) cur.classList.add('active');
}

function buildReview() {
  const rc = document.getElementById('reviewCard');
  if (!rc) return;
  rc.innerHTML = `
    <p><strong>Seller:</strong> ${sellerData.name} &lt;${sellerData.email}&gt;</p>
    <p><strong>Phone:</strong> ${sellerData.phone || 'Not provided'}</p>
    ${sellerData.bio ? `<p><strong>Bio:</strong> ${sellerData.bio}</p>` : ''}
    <hr style="border:none;border-top:1px solid var(--card-border);margin:1rem 0"/>
    <p class="app-product"><strong>Product:</strong> ${sellerData.productName}</p>
    <p><strong>Price:</strong> ${formatPrice(sellerData.productPrice)}</p>
    <p><strong>Category:</strong> ${sellerData.productCategory}</p>
    <p><strong>Condition:</strong> ${sellerData.productCondition}</p>
    <p><strong>Description:</strong> ${sellerData.productDesc}</p>
  `;
}

function submitApplication() {
  const agree = document.getElementById('agreeTerms');
  const err   = document.getElementById('err-agreeTerms');
  if (!agree.checked) { err.textContent = 'You must agree to the terms.'; return; }
  err.textContent = '';

  const apps = getApplications();
  const id   = nextId(apps);
  apps.push({
    id,
    sellerName:      sellerData.name,
    sellerEmail:     sellerData.email,
    sellerPhone:     sellerData.phone || '',
    sellerBio:       sellerData.bio || '',
    passwordHash:    btoa(sellerData.password), // base64 only — use bcrypt in production
    productName:     sellerData.productName,
    productPrice:    sellerData.productPrice,
    productCategory: sellerData.productCategory,
    productDesc:     sellerData.productDesc,
    productCondition:sellerData.productCondition,
    productImage:    sellerData.productImage || '',
    status:          'pending',
    createdAt:       Date.now(),
  });
  saveApplications(apps);

  [1,2,3].forEach(i => document.getElementById(`formStep${i}`)?.classList.add('hidden'));
  document.getElementById('formSuccess')?.classList.remove('hidden');
  [1,2,3].forEach(i => {
    const ind = document.getElementById(`step${i}Indicator`);
    if (ind) { ind.classList.remove('active'); ind.classList.add('done'); }
  });
}

// ===================== ADMIN PAGE =====================

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'usman2024';

function adminLogin() {
  const user = document.getElementById('adminUser')?.value;
  const pass = document.getElementById('adminPass')?.value;
  const err  = document.getElementById('loginError');
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    document.getElementById('adminGate').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    loadAdminData();
  } else {
    err.textContent = 'Incorrect credentials. Please try again.';
  }
}

function adminLogout() {
  document.getElementById('adminGate').classList.remove('hidden');
  document.getElementById('adminDashboard').classList.add('hidden');
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
}

function initAdmin() {
  document.getElementById('adminDate').textContent =
    new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
      document.getElementById(`tab-${tab}`)?.classList.remove('hidden');
      if (tab === 'products')     renderProductsTable();
      if (tab === 'sellers')      renderSellersTable();
      if (tab === 'applications') renderApplications();
    });
  });

  // Allow pressing Enter on login form
  document.getElementById('adminPass')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') adminLogin();
  });
}

function loadAdminData() {
  const products = getProducts().filter(p => p.status === 'live').length;
  const sellers  = getSellers().filter(s => s.status === 'active').length;
  const pending  = getApplications().filter(a => a.status === 'pending').length;
  const approved = Number(DB.get('approvedCount') || 0);

  document.getElementById('adm-products').textContent = products;
  document.getElementById('adm-sellers').textContent  = sellers;
  document.getElementById('adm-pending').textContent  = pending;
  document.getElementById('adm-approved').textContent = approved;
  document.getElementById('pendingBadge').textContent = pending;

  renderRecentApps();
}

function renderRecentApps() {
  const apps = getApplications().sort((a,b) => b.createdAt - a.createdAt).slice(0, 5);
  const container = document.getElementById('recentApps');
  if (!container) return;
  if (apps.length === 0) { container.innerHTML = '<p class="no-apps">No applications yet.</p>'; return; }
  container.innerHTML = apps.map(a => `
    <div class="app-card">
      <div>
        <h3>${a.sellerName}</h3>
        <p>${a.sellerEmail}</p>
        <p class="app-product">"${a.productName}" — ${formatPrice(a.productPrice)}</p>
        <p style="margin-top:0.5rem">${new Date(a.createdAt).toLocaleDateString('en-GB')}</p>
      </div>
      <div class="action-btns">
        <span class="status-badge status-${a.status}">${a.status}</span>
      </div>
    </div>
  `).join('');
}

function renderProductsTable() {
  const products = getProducts();
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${formatPrice(p.price)}</td>
      <td>${p.seller}</td>
      <td><span class="status-badge status-${p.status === 'live' ? 'live' : 'pending'}">${p.status}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Remove</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function deleteProduct(id) {
  if (!confirm('Remove this product?')) return;
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
  renderProductsTable();
  loadAdminData();
}

function renderSellersTable() {
  const sellers = getSellers();
  const tbody = document.getElementById('sellersTableBody');
  if (!tbody) return;
  if (sellers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-dim);font-style:italic;padding:2rem">No sellers yet.</td></tr>';
    return;
  }
  tbody.innerHTML = sellers.map(s => {
    const count = getProducts().filter(p => p.sellerId === s.id).length;
    return `
      <tr>
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${count}</td>
        <td><span class="status-badge status-${s.status === 'active' ? 'live' : 'rejected'}">${s.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-danger btn-sm" onclick="removeSeller(${s.id})">Remove</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function removeSeller(id) {
  if (!confirm('Remove this seller and their products?')) return;
  const sellers  = getSellers().filter(s => s.id !== id);
  const products = getProducts().filter(p => p.sellerId !== id);
  saveSellers(sellers);
  saveProducts(products);
  renderSellersTable();
  loadAdminData();
}

function renderApplications() {
  const apps = getApplications().filter(a => a.status === 'pending');
  const container = document.getElementById('applicationsContainer');
  if (!container) return;
  if (apps.length === 0) {
    container.innerHTML = '<p class="no-apps">✦ No pending applications. The queue is clear.</p>';
    return;
  }
  container.innerHTML = apps.map(a => `
    <div class="app-card" id="appCard${a.id}">
      <div>
        <h3>${a.sellerName}</h3>
        <p>📧 ${a.sellerEmail}${a.sellerPhone ? ' &nbsp;·&nbsp; 📱 ' + a.sellerPhone : ''}</p>
        ${a.sellerBio ? `<p style="font-style:italic;margin-top:0.3rem">"${a.sellerBio}"</p>` : ''}
        <hr style="border:none;border-top:1px solid var(--card-border);margin:0.8rem 0"/>
        <p class="app-product">📦 <strong>${a.productName}</strong></p>
        <p>${a.productCategory} · ${a.productCondition} · ${formatPrice(a.productPrice)}</p>
        <p style="margin-top:0.4rem;font-size:0.82rem;color:var(--text-dim)">${a.productDesc}</p>
        <p style="margin-top:0.8rem;font-size:0.78rem;color:var(--text-dim)">Applied ${new Date(a.createdAt).toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</p>
      </div>
      <div class="app-actions">
        <button class="btn btn-success btn-sm" onclick="approveApplication(${a.id})">✓ Approve</button>
        <button class="btn btn-danger btn-sm" onclick="rejectApplication(${a.id})">✗ Reject</button>
      </div>
    </div>
  `).join('');
}

function approveApplication(id) {
  const apps = getApplications();
  const app  = apps.find(a => a.id === id);
  if (!app) return;

  // Create seller
  const sellers   = getSellers();
  const sellerId  = nextId(sellers);
  sellers.push({ id: sellerId, name: app.sellerName, email: app.sellerEmail, phone: app.sellerPhone, bio: app.sellerBio, status: 'active', createdAt: Date.now() });
  saveSellers(sellers);

  // Create product
  const products = getProducts();
  products.push({
    id:          nextId(products),
    name:        app.productName,
    category:    app.productCategory,
    price:       app.productPrice,
    description: app.productDesc,
    condition:   app.productCondition,
    image:       app.productImage,
    seller:      app.sellerName,
    sellerId:    sellerId,
    status:      'live',
    createdAt:   Date.now(),
  });
  saveProducts(products);

  // Update application
  app.status = 'approved';
  saveApplications(apps);

  // Increment counter
  DB.set('approvedCount', (Number(DB.get('approvedCount') || 0) + 1));

  loadAdminData();
  renderApplications();
  showToast(`✓ ${app.sellerName}'s application approved. Product is now live.`);
}

function rejectApplication(id) {
  if (!confirm('Reject this application?')) return;
  const apps = getApplications();
  const app  = apps.find(a => a.id === id);
  if (app) { app.status = 'rejected'; saveApplications(apps); }
  loadAdminData();
  renderApplications();
  showToast(`Application rejected.`, true);
}

// ===================== ADD PRODUCT (ADMIN) =====================

function openAddProduct() {
  document.getElementById('addProductOverlay')?.classList.remove('hidden');
}
function closeAddProduct() {
  document.getElementById('addProductOverlay')?.classList.add('hidden');
}
function saveNewProduct() {
  const name  = document.getElementById('newProductName')?.value.trim();
  const price = document.getElementById('newProductPrice')?.value;
  const cat   = document.getElementById('newProductCat')?.value;
  const desc  = document.getElementById('newProductDesc')?.value.trim();
  const img   = document.getElementById('newProductImg')?.value.trim();
  if (!name || !price || !cat) { showToast('Please fill name, price, and category.', true); return; }
  const products = getProducts();
  products.push({ id: nextId(products), name, category: cat, price: Number(price), description: desc || 'A fine product from Usman Store.', condition: 'new', image: img || '', seller: 'Admin', sellerId: 0, status: 'live', createdAt: Date.now() });
  saveProducts(products);
  closeAddProduct();
  renderProductsTable();
  loadAdminData();
  showToast('Product added successfully.');
}

// ===================== TOAST =====================

function showToast(msg, isError = false) {
  const existing = document.getElementById('usmanToast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'usmanToast';
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
    background: isError ? 'var(--danger)' : 'var(--gold)',
    color: isError ? '#fff' : 'var(--ink)',
    fontFamily: "'Cinzel', serif", fontSize: '0.72rem', letterSpacing: '0.1em',
    padding: '1rem 1.8rem', borderRadius: '2px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    animation: 'fadeUp 0.3s ease',
    maxWidth: '360px',
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
