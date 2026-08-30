document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryType = urlParams.get('type') || 'All';
    const subType = urlParams.get('sub') || ''; // Attar അല്ലെങ്കിൽ Spray ഫിൽട്ടർ ചെയ്യാൻ

    document.getElementById('pageTitle').innerText = `${categoryType} ${subType ? '- ' + subType : ''} Collection`;

    // LocalStorage-ൽ നിന്ന് പ്രൊഡക്ടുകൾ എടുക്കുന്നു (Admin പാനലിൽ നിന്ന് ആഡ് ചെയ്തവ)
    let products = JSON.parse(localStorage.getItem('aalam_products')) || [
        { id: 1, title: 'Royal Oud Attar', category: 'Men', sub: 'Attar', price: 499, sizes: '12ml, 25ml', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600', desc: 'Pure traditional long-lasting royal oud.' },
        { id: 2, title: 'Oud Al Sultan Spray', category: 'Men', sub: 'Spray', price: 1299, sizes: '50ml, 100ml', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600', desc: 'Sophisticated modern luxury spray for men.' },
        { id: 3, title: 'Jasmine Bloom', category: 'Women', sub: 'Attar', price: 399, sizes: '12ml, 25ml', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=600', desc: 'Soft and refreshing floral notes.' },
        { id: 4, title: 'Golden Amber Combo', category: 'Combo', sub: 'Spray', price: 1999, sizes: 'Combo Pack', image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=600', desc: 'Exclusive gift combo pack for special occasions.' }
    ];

    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    // ഫിൽട്ടറിംഗ്
    let filteredProducts = products.filter(p => {
        let matchCategory = categoryType === 'All' || p.category.toLowerCase() === categoryType.toLowerCase();
        let matchSub = !subType || (p.sub && p.sub.toLowerCase() === subType.toLowerCase());
        return matchCategory && matchSub;
    });

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5"><h4>No products found in this category.</h4></div>`;
        return;
    }

    filteredProducts.forEach(product => {
        grid.innerHTML += `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 220px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-secondary mb-2 align-self-start">${product.category} ${product.sub ? '• ' + product.sub : ''}</span>
                        <h5 class="card-title fw-bold fs-6">${product.title}</h5>
                        <p class="text-muted small mb-2">${product.desc.substring(0, 50)}...</p>
                        <div class="mt-auto">
                            <div class="text-danger fw-bold mb-2">₹${product.price}</div>
                            <button onclick="addToCart(${product.id})" class="btn btn-gold btn-sm w-100 fw-bold">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    updateCartBadge();
});

// കാർട്ടിലേക്ക് ആഡ് ചെയ്യാനുള്ള ഫങ്ഷൻ
function addToCart(productId) {
    let products = JSON.parse(localStorage.getItem('aalam_products')) || [];
    let product = products.find(p => p.id === productId);
    
    if(!product) return;

    let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
    let existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem('aalam_cart', JSON.stringify(cart));
    updateCartBadge();
    alert('Product added to cart successfully!');
}

function updateCartBadge() {
    let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    let badge = document.getElementById('cartBadge');
    if(badge) badge.innerText = totalCount;
}