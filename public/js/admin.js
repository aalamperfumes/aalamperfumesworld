document.addEventListener("DOMContentLoaded", () => {
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let user = document.getElementById('adminUser').value;
            let pass = document.getElementById('adminPass').value;

            // സിമ്പിൾ സെല്ലർ ലോഗിൻ ക്രെഡൻഷ്യൽസ്
            if (user === 'admin' && pass === 'aalam2026') {
                localStorage.setItem('aalam_logged', 'true');
                checkAdminAuth();
            } else {
                alert('Invalid Username or Password!');
            }
        });
    }

    // Product Form Handler (Add/Edit)
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProduct();
        });
    }

    checkAdminAuth();
    loadAdminProducts();
});

function checkAdminAuth() {
    let isLogged = localStorage.getItem('aalam_logged');
    if (isLogged === 'true') {
        document.getElementById('login-container').classList.add('d-none');
        document.getElementById('dashboard-container').classList.remove('d-none');
        loadAdminProducts();
    } else {
        document.getElementById('login-container').classList.remove('d-none');
        document.getElementById('dashboard-container').classList.add('d-none');
    }
}

function logoutAdmin() {
    localStorage.removeItem('aalam_logged');
    checkAdminAuth();
}

function saveProduct() {
    let id = document.getElementById('prodId').value;
    let title = document.getElementById('prodTitle').value;
    let category = document.getElementById('prodCategory').value;
    let sub = document.getElementById('prodSub').value; // Attar അല്ലെങ്കിൽ Spray
    let price = parseFloat(document.getElementById('prodPrice').value);
    let sizes = document.getElementById('prodSizes').value;
    let image = document.getElementById('prodImage').value.trim();
    let desc = document.getElementById('prodDesc').value;

    // ഇമേജ് പാത്ത് ശരിയാണെന്ന് ഉറപ്പാക്കാൻ (ഫയൽ നെയിം മാത്രം കൊടുത്താലും images/ ചേർക്കാൻ)
    if (image && !image.startsWith('http') && !image.startsWith('images/')) {
        image = 'images/' + image;
    }

    let products = JSON.parse(localStorage.getItem('aalam_products')) || [];

    if (id) {
        // Edit existing product
        let index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { 
                id: Number(id), 
                title, 
                name: title, // kompatibility-ക്കായി name ഉം കൂടെ നൽകുന്നു
                category, 
                sub, 
                price, 
                sizes, 
                image, 
                desc 
            };
        }
    } else {
        // Add new product
        let newProduct = {
            id: Date.now(),
            title,
            name: title,
            category,
            sub,
            price,
            sizes,
            image,
            desc
        };
        products.push(newProduct);
    }

    localStorage.setItem('aalam_products', JSON.stringify(products));
    document.getElementById('productForm').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('form-title').innerText = 'Add New Product';
    loadAdminProducts();
    alert('Product saved successfully!');
}

function loadAdminProducts() {
    let listEl = document.getElementById('admin-product-list');
    if (!listEl) return;

    let products = JSON.parse(localStorage.getItem('aalam_products')) || [];
    listEl.innerHTML = '';

    if (products.length === 0) {
        listEl.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No products available.</td></tr>`;
        return;
    }

    products.forEach((p) => {
        listEl.innerHTML += `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${p.image}" class="rounded" style="width: 40px; height: 40px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/40'">
                        <div>
                            <span class="fw-semibold d-block">${p.title || p.name}</span>
                            <small class="text-muted">${p.sub || 'Attar'}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-dark">${p.category}</span></td>
                <td>₹${p.price}</td>
                <td>
                    <button onclick="editProduct(${p.id})" class="btn btn-sm btn-outline-primary me-1"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProduct(${p.id})" class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function editProduct(id) {
    let products = JSON.parse(localStorage.getItem('aalam_products')) || [];
    let p = products.find(item => item.id == id);
    if (!p) return;

    document.getElementById('prodId').value = p.id;
    document.getElementById('prodTitle').value = p.title || p.name;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodSub').value = p.sub || 'Attar';
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodSizes').value = p.sizes;
    document.getElementById('prodImage').value = p.image;
    document.getElementById('prodDesc').value = p.desc;
    document.getElementById('form-title').innerText = 'Edit Product';
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = JSON.parse(localStorage.getItem('aalam_products')) || [];
        products = products.filter(p => p.id != id);
        localStorage.setItem('aalam_products', JSON.stringify(products));
        loadAdminProducts();
    }
}

function loadOrders() {
    let ordersListEl = document.getElementById('orders-list');
    if (!ordersListEl) return;

    let orders = JSON.parse(localStorage.getItem('aalam_orders')) || [];
    ordersListEl.innerHTML = '';

    if (orders.length === 0) {
        ordersListEl.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No orders received yet.</td></tr>`;
        return;
    }

    orders.forEach(o => {
        let itemsHtml = o.items.map(i => `${i.title || i.name} (${i.qty})`).join('<br>');
        ordersListEl.innerHTML += `
            <tr>
                <td class="fw-bold">${o.id}<br><small class="text-muted">${o.date}</small></td>
                <td><strong>${o.name}</strong><br>${o.phone}<br><small>${o.address}</small></td>
                <td>${itemsHtml}</td>
                <td class="fw-bold text-success">₹${o.total}</td>
                <td><span class="badge bg-warning text-dark">WhatsApp Placed</span></td>
            </tr>
        `;
    });
}