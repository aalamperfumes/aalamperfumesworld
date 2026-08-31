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
                    <img src="${item.image}" class="rounded" style="width: 60px; height: 60px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/60'">
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

// ================= DATABASE-ലേക്ക് ORDER SAVE ചെയ്ത് WHATSAPP-ലേക്ക് അയ്ക്കുന്ന ഫങ്ഷൻ =================
async function checkoutWhatsApp() {
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

    let totalAmount = 0;

    // WhatsApp സന്ദേശം ഉണ്ടാക്കുന്നു
    let message = `*New Order - Aalam Perfumes*%0A%0A`;
    message += `*Customer Details:*%0A`;
    message += `Name: ${name}%0A`;
    message += `Phone: ${phone}%0A`;
    message += `City: ${city}%0A`;
    message += `Address: ${address} - ${pincode}%0A%0A`;
    message += `*Order Items:*%0A`;

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.qty;
        totalAmount += itemTotal;
        message += `${index + 1}. ${item.title} (${item.qty} pcs) : ₹${itemTotal}%0A`;
        if (item.image) {
            message += `   Image: ${encodeURIComponent(item.image)}%0A`;
        }
    });

    message += `%0A*Total Amount: ₹${totalAmount}*`;

    // 1. ഓർഡർ വിവരങ്ങൾ Server (MongoDB) വഴി ഡാറ്റാബേസിലേക്ക് സേവ് ചെയ്യുന്നു
    try {
        await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerInfo: { name, phone, city, address, pincode },
                items: cart,
                totalAmount: totalAmount
            })
        });
    } catch (error) {
        console.error('Error saving order to database:', error);
    }

    // 2. WhatsApp ചാറ്റിലേക്ക് റീഡയറക്ട് ചെയ്യുന്നു
    let whatsappNumber = "918281914965"; 
    let whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;

    // കാർട്ട് ക്ലിയർ ചെയ്ത് WhatsApp തുറക്കുന്നു
    localStorage.removeItem('aalam_cart');
    window.open(whatsappURL, '_blank');
    window.location.href = 'index.html';
}
