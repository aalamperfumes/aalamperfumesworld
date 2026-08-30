document.addEventListener('DOMContentLoaded', () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryType = urlParams.get('type') || '';
        const subType = urlParams.get('sub') || '';

        const pageTitleEl = document.getElementById('pageTitle');
        if (pageTitleEl) {
            pageTitleEl.innerText = `${categoryType || 'All'} ${subType ? '- ' + subType : ''} Collection`;
        }
        
        // LocalStorage-ൽ നിന്ന് പ്രൊഡക്റ്റുകൾ എടുക്കുന്നു
        const products = JSON.parse(localStorage.getItem('aalam_products')) || [];
        
        const grid = document.getElementById('productGrid') || document.querySelector('.product-grid');
        if (grid) {
            const filteredProducts = products.filter(p => {
                let matchCategory = !categoryType || (p.category && p.category.toLowerCase() === categoryType.toLowerCase());
                let matchSub = !subType || (p.sub && p.sub.toLowerCase() === subType.toLowerCase());
                return matchCategory && matchSub;
            });

            if (filteredProducts.length === 0) {
                grid.innerHTML = `<div class="col-12 text-center py-5"><h4>No products found in this category.</h4></div>`;
                return;
            }

            grid.innerHTML = filteredProducts.map(product => `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="product-card card h-100 border-0 shadow-sm rounded-4 overflow-hidden p-3">
                        <img src="${product.image}" alt="${product.title || product.name}" class="card-img-top rounded" style="height: 220px; object-fit: cover;">
                        <div class="card-body px-0 d-flex flex-column">
                            <span class="badge bg-secondary mb-2 align-self-start">${product.category || ''} ${product.sub ? '• ' + product.sub : ''}</span>
                            <h5 class="card-title fw-bold fs-6">${product.title || product.name}</h5>
                            <p class="text-danger fw-bold mb-2">₹${product.price}</p>
                            <button onclick="addToCart('${product.id}')" class="btn btn-gold btn-sm w-100 fw-bold mt-auto">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }

    updateCartBadge();
});

function addToCart(productId) {
    try {
        let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
        let products = JSON.parse(localStorage.getItem('aalam_products')) || [];
        
        const product = products.find(p => p.id == productId);

        if (!product) {
            alert('Product not found!');
            return;
        }

        let existingItem = cart.find(item => item.id == productId);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }

        localStorage.setItem('aalam_cart', JSON.stringify(cart));
        updateCartBadge();
        alert('Product added to cart successfully!');
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

function updateCartBadge() {
    let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    let badge = document.getElementById('cartBadge') || document.getElementById('cart-count');
    if (badge) {
        badge.innerText = totalCount;
    }
}