document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryType = urlParams.get('type') || 'All';
    const subType = urlParams.get('sub') || ''; // Attar അല്ലെങ്കിൽ Spray ഫിൽട്ടർ ചെയ്യാൻ

    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) {
        pageTitleEl.innerText = `${categoryType} ${subType ? '- ' + subType : ''} Collection`;
    }

    let products = [];

    // LocalStorage-ന് പകരം API (MongoDB) വഴി ഡാറ്റാബേസിൽ നിന്ന് എടുക്കുന്നു
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            products = await response.json();
        }
    } catch (error) {
        console.error("Error fetching products from server:", error);
    }

    // ഡാറ്റാബേസ് ഒഴിഞ്ഞുകിടക്കുകയാണെങ്കിൽ മാത്രം കാണിക്കാനുള്ള Sample Data (ഓപ്ഷണൽ)
    if (!products || products.length === 0) {
        products = [
            { id: '1', name: 'Royal Oud Attar', category: 'Men', sub: 'Attar', price: 499, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600', description: 'Pure traditional long-lasting royal oud.' },
            { id: '2', name: 'Oud Al Sultan Spray', category: 'Men', sub: 'Spray', price: 1299, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600', description: 'Sophisticated modern luxury spray for men.' },
            { id: '3', name: 'Jasmine Bloom', category: 'Women', sub: 'Attar', price: 399, image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=600', description: 'Soft and refreshing floral notes.' }
        ];
    }

    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    // Category, Sub-category ഫിൽട്ടറിംഗ്
    let filteredProducts = products.filter(p => {
        let prodCategory = p.category || '';
        let prodSub = p.sub || '';
        let matchCategory = categoryType === 'All' || prodCategory.toLowerCase() === categoryType.toLowerCase();
        let matchSub = !subType || prodSub.toLowerCase() === subType.toLowerCase();
        return matchCategory && matchSub;
    });

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5"><h4>No products found in this category.</h4></div>`;
        return;
    }

    filteredProducts.forEach(product => {
        let pTitle = product.name || product.title;
        let pDesc = product.description || product.desc || '';
        
        grid.innerHTML += `
            <div class="col-6 col-md-4 col-lg-3 mb-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <img src="${product.image}" class="card-img-top" alt="${pTitle}" style="height: 220px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/220'">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-secondary mb-2 align-self-start">${product.category} ${product.sub ? '• ' + product.sub : ''}</span>
                        <h5 class="card-title fw-bold fs-6">${pTitle}</h5>
                        <p class="text-muted small mb-2">${pDesc.substring(0, 50)}...</p>
                        <div class="mt-auto">
                            <div class="text-danger fw-bold mb-2">₹${product.price}</div>
                            <button onclick="addToCart('${product.id}')" class="btn btn-gold btn-sm w-100 fw-bold">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    updateCartBadge();
});

// DATABASE-ൽ നിന്ന് വിവരങ്ങൾ എടുത്ത് CART-ലേക്ക് ആഡ് ചെയ്യാനുള്ള ഫങ്ഷൻ
async function addToCart(productId) {
    try {
        let response = await fetch('/api/products/' + productId);
        let product = await response.json();

        if (!product || product.error) {
            alert('Product details could not be found!');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
        let existingItem = cart.find(item => item.id == productId);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.name || product.title,
                price: product.price,
                image: product.image,
                qty: 1
            });
        }

        localStorage.setItem('aalam_cart', JSON.stringify(cart));
        updateCartBadge();
        alert('Product added to cart successfully!');
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
}

function updateCartBadge() {
    let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    let badge = document.getElementById('cartBadge');
    if (badge) badge.innerText = totalCount;
}
