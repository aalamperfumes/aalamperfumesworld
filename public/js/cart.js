document.addEventListener("DOMContentLoaded", () => {
    loadCartItems();

    const shippingForm = document.getElementById('shippingForm');
    if (shippingForm) {
        shippingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            checkoutWhatsApp();
        });
    }
});

function loadCartItems() {
    let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
    let container = document.getElementById('cartItems');
    let totalAmountEl = document.getElementById('totalAmount');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p class="text-muted text-center py-3">Your cart is empty.</p>`;
        if (totalAmountEl) totalAmountEl.innerText = '₹0';
        updateCartBadge();
        return;
    }

    container.innerHTML = '';
    let grandTotal = 0;

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.qty;
        grandTotal += itemTotal;

        container.innerHTML += `
            <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
                <div class="d-flex align-items-center gap-3">
                    <img src="${item.image}" class="rounded" style="width: 60px; height: 60px; object-fit: cover;">
                    <div>
                        <h6 class="fw-bold mb-1">${item.title}</h6>
                        <small class="text-muted">₹${item.price} x ${item.qty}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <span class="fw-bold text-dark">₹${itemTotal}</span>
                    <button onclick="removeFromCart(${index})" class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    if (totalAmountEl) totalAmountEl.innerText = `₹${grandTotal}`;
    updateCartBadge();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('aalam_cart', JSON.stringify(cart));
    loadCartItems();
}

function updateCartBadge() {
    let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    let badge = document.getElementById('cartBadge');
    if (badge) badge.innerText = totalCount;
}

function checkoutWhatsApp() {
    let cart = JSON.parse(localStorage.getItem('aalam_cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    let name = document.getElementById('customerName').value;
    let phone = document.getElementById('customerPhone').value;
    let city = document.getElementById('customerCity').value;
    let address = document.getElementById('customerAddress').value;
    let pincode = document.getElementById('customerPincode').value;

    let message = `*New Order - Aalam Perfumes*%0A%0A`;
    message += `*Customer Details:*%0A`;
    message += `Name: ${name}%0A`;
    message += `Phone: ${phone}%0A`;
    message += `City: ${city}%0A`;
    message += `Address: ${address} - ${pincode}%0A%0A`;
    message += `*Order Items:*%0A`;

    let total = 0;
    cart.forEach(item => {
        message += `- ${item.title} (${item.qty} pcs) : ₹${item.price * item.qty}%0A`;
        total += item.price * item.qty;
    });

    message += `%0A*Total Amount: ₹${total}*`;

    // WhatsApp നമ്പർ (നിങ്ങളുടെ ഷോപ്പ് വാട്സാപ്പ് നമ്പർ ഇവിടെ നൽകുക)
    let whatsappNumber = "918281914965"; 
    let whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;

    // ഓർഡർ ലോക്കൽ സ്റ്റോറേജിൽ സേവ് ചെയ്യാം (Admin പാനലിൽ കാണാൻ)
    let orders = JSON.parse(localStorage.getItem('aalam_orders')) || [];
    orders.push({
        id: 'ALM-' + Math.floor(100000 + Math.random() * 900000),
        name, phone, address: `${city}, ${address} - ${pincode}`, items: cart, total, date: new Date().toLocaleString()
    });
    localStorage.setItem('aalam_orders', JSON.stringify(orders));

    // കാർട്ട് ക്ലിയർ ചെയ്ത് WhatsApp-ലേക്ക് റീഡയറക്ട് ചെയ്യുക
    localStorage.removeItem('aalam_cart');
    window.open(whatsappURL, '_blank');
    window.location.href = 'index.html';
}