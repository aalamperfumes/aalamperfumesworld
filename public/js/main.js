document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryType = urlParams.get('type') || 'All';
    const subType = urlParams.get('sub') || ''; 

    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) {
        pageTitleEl.innerText = `${categoryType} ${subType ? '- ' + subType : ''} Collection`;
    }

    const grid = document.getElementById('productGrid');
    if (!grid) return;

    // Loading State
    grid.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-gold" role="status"></div><p class="mt-2">Loading Products...</p></div>`;

    let products = [];

    // MongoDB Atlas API വഴി ഡാറ്റ ഫെച്ച് ചെയ്യുന്നു
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            products = await response.json();
        } else {
            console.error("Failed to load products from server");
        }
    } catch (error) {
        console.error("Error fetching products from server:", error);
    }

    grid.innerHTML = '';

    // പ്രൊഡക്റ്റുകൾ ഒന്നുമില്ലെങ്കിൽ
    if (!products || products.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5"><h4>No products available in the store yet.</h4></div>`;
        return;
    }

    // Category & Sub-category Filtering (Case-Insensitive)
    let filteredProducts = products.filter(p => {
        let prodCategory = (p.category || '').toLowerCase().trim();
        let prodSub = (p.sub || '').toLowerCase().trim();
        
        let targetCategory = categoryType.toLowerCase().trim();
        let targetSub = subType.toLowerCase().trim();

        let matchCategory = targetCategory === 'all' || prodCategory === targetCategory;
        let matchSub = !targetSub || prodSub === targetSub;
        
        return matchCategory && matchSub;
    });

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5"><h4>No products found in ${categoryType} ${subType}.</h4></div>`;
        return;
    }

    // Products Render ചെയ്യൽ
    filteredProducts.forEach(product => {
        let pTitle = product.name || product.title || 'Fragrance Product';
        let pDesc = product.description || product.desc || '';
        let pId = product.id || product._id;
        
        grid.innerHTML += `
            <div class="col-6 col-md-4 col-lg-3 mb-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <img src="${product.image}" class="card-img-top" alt="${pTitle}" style="height: 220px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/220?text=Aalam+Perfumes'">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-secondary mb-2 align-self-start">${product.category} ${product.sub ? '• ' + product.sub : ''}</span>
                        <h5 class="card-title fw-bold fs-6">${pTitle}</h5>
                        <p class="text-muted small mb-2">${pDesc.length > 45 ? pDesc.substring(0, 45) + '...' : pDesc}</p>
                        <div class="mt-auto">
                            <div class="text-danger fw-bold mb-2">₹${product.price}</div>
                            <button onclick="addToCart('${pId}')" class="btn btn-gold btn-sm w-100 fw-bold text-dark">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    updateCartBadge();
});

// CART-ലേക്ക് ആഡ് ചെയ്യാനുള്ള ഫങ്ഷൻ
async function addToCart(productId) {
    try {
        let response = await fetch('/api/products/' + productId);
        let product = await response.json();

        if (!product || product.error) {
            alert('Product details could not be found!');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
        let existingItem = cart.find(item => item.id == (product.id || product._id));

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                id: product.id || product._id,
                title: product.name || product.title,
                price: product.price,
                image: product.image,
                qty: 1
            });
        }

        localStorage.setItem('aalam_cart', JSON.stringify(cart));
        updateCartBadge();
        alert(`${product.name || 'Product'} added to cart!`);
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
}

function updateCartBadge() {
    let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    let badge = document.getElementById('cartBadge') || document.getElementById('cart-count');
    if (badge) badge.innerText = totalCount;
}
