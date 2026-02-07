
import { getCurrentUser } from '../services/auth_services.js';
import { massage } from '../Utilities/helpers.js';
import * as cartServices from '../services/cart_services.js';

const currentUser = getCurrentUser();
let cart = [];
if (currentUser) {
    cart = await cartServices.getCart(currentUser.email)
} else {
    cart = await cartServices.getCart('guest')
}

let currentDiscount = 0;

export function displayCartItems() {
    const container = document.getElementById('cartItems');
    const emptyMsg = document.getElementById('emptyCart');

    if (!container) return;

    container.innerHTML = '';

    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove('hidden');
        updateSummary();
        return;
    }

    if (emptyMsg) emptyMsg.classList.add('hidden');

    cart.forEach(item => {
        container.innerHTML += `
            <div class="bg-(--sec-bg) rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-(--border) hover:border-(--primary)/30 transition">
                <div class="flex items-center gap-6 w-full">
                    <div class="w-24 h-24 bg-(--bg-cream) rounded-2xl flex items-center justify-center p-2 shrink-0">
                        <img src="${item.mainImage || '../assets/images/item1.jpg'}" alt="${item.name || 'Product'}" class="w-full h-full object-contain">
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-(--main-text) mb-1">${item.name || 'Unnamed Product'}</h3>
                        <p class="text-(--sec-text) text-sm">${item.category || 'Delicious meal'}</p>
                        <div class="mt-4 flex items-center gap-4 md:hidden">
                            <div class="flex items-center gap-4 bg-(--bg-cream) rounded-full px-4 py-1.5">
                                <button onclick="updateQuantity('${item.productId}', -1)" class="text-(--primary) font-bold">-</button>
                                <span class="font-bold text-(--main-text)">${item.qty || 1}</span>
                                <button onclick="updateQuantity('${item.productId}', 1)" class="text-(--primary) font-bold">+</button>
                            </div>
                            <span class="text-xl font-bold text-(--primary) ml-auto">$${item.price || 0}</span>
                        </div>
                    </div>
                </div>
                <div class="hidden md:flex items-center gap-10">
                    <div class="flex items-center gap-4 bg-(--bg-cream) rounded-full px-5 py-2">
                        <button onclick="updateQuantity('${item.productId}', -1)" class="text-(--primary) font-bold hover:scale-110 transition">-</button>
                        <span class="font-bold min-w-[20px] text-center text-(--main-text)">${item.qty || 1}</span>
                        <button onclick="updateQuantity('${item.productId}', 1)" class="text-(--primary) font-bold hover:scale-110 transition">+</button>
                    </div>
                    <span class="text-2xl font-bold min-w-[100px] text-right text-(--primary)">$${(item.price * (item.qty || 1)).toFixed(2)}</span>
                    <button onclick="removeItem('${item.productId}')" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });

    updateSummary();
}

function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const delivery = subtotal > 0 ? 10 : 0;
    const discountAmount = subtotal * currentDiscount;
    const total = subtotal - discountAmount + delivery;

    const elements = {
        subtotal: document.getElementById('subtotal'),
        discount: document.getElementById('discount'),
        delivery: document.getElementById('delivery'),
        total: document.getElementById('total')
    };

    if (elements.subtotal) elements.subtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (elements.discount) elements.discount.textContent = `-$${discountAmount.toFixed(2)}`;
    if (elements.delivery) elements.delivery.textContent = `$${delivery.toFixed(2)}`;
    if (elements.total) elements.total.textContent = `$${total.toFixed(2)}`;


}

window.removeItem = function (productId) {
    cart = cart.filter(item => item.productId != productId);
    if (currentUser) {
        cartServices.updateCart(currentUser.email, cart)
    } else {
        cartServices.updateCart('guest', cart)
    }
    displayCartItems();
};

window.updateQuantity = function (productId, change) {
    const item = cart.find(item => item.productId == productId);
    if (item) {
        item.qty = (item.qty || 1) + change;
        if (item.qty < 1) item.qty = 1;
    }
    if (currentUser) {
        cartServices.updateCart(currentUser.email, cart)
    } else {
        cartServices.updateCart('guest', cart)
    }
    displayCartItems();
};

document.getElementById('applyPromo')?.addEventListener('click', () => {
    const code = document.getElementById('promoCode')?.value;

    if (code === "ITI2026") {
        currentDiscount = 0.10;
        localStorage.setItem('appliedDiscount', JSON.stringify(currentDiscount));

        massage('Promo code applied! 10% off', 'success');
    } else if (code === "ITI.NET") {
        currentDiscount = 0.20;
        localStorage.setItem('appliedDiscount', JSON.stringify(currentDiscount));

        massage('Promo code applied! 20% off', 'success');
    }

    else {
        currentDiscount = 0;
        massage('Invalid promo code', 'error');

    }
    updateSummary();
});

document.getElementById("checkoutBtn").addEventListener("click", async () => {
    if (!currentUser) {
        massage('Please login first', 'error');
        window.location.hash = "#login"; // بدل href
        return;
    }

    if (cart.length === 0) {
        massage('Your cart is empty', 'error');
        return;
    }

    window.location.hash = "#checkout";
});


displayCartItems();