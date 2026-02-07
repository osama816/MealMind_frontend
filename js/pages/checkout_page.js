import { getCurrentUser } from '../services/auth_services.js';
import { massage } from '../Utilities/helpers.js';
import { createOrder } from '../services/checkout.js';
import * as cartServices from '../services/cart_services.js';
const user = getCurrentUser();
let cart = [];

if (user) {
    cart = await cartServices.getCart(user.email);
} else {
    window.location.hash = '#login';
}

let savedDiscountPercent = JSON.parse(localStorage.getItem('appliedDiscount')) || 0;

function initCheckout() {
    const itemsContainer = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const discountEl = document.getElementById('checkoutDiscount');
    const totalEl = document.getElementById('checkoutTotal');
    const form = document.getElementById('checkoutForm');
    const fullName = document.getElementById('fullname');
    const address = document.getElementById('address');
    const phone = document.getElementById('phone');
    const paymentMethod = document.querySelectorAll('input[name="payment"]');
    if (cart.length === 0) {
        window.location.hash = '#cart';
        return;
    }
    let method = "cash on delivery";
    paymentMethod.forEach(input => {
        input.addEventListener('change', () => {
            method = input.value;
        });
    });
    itemsContainer.innerHTML = cart.map(item => `
        <div class="flex justify-between text-sm">
            <span class="opacity-80">${item.name} (x${item.qty})</span>
            <span class="font-medium">$${(item.price * item.qty).toFixed(2)}</span>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const delivery = 10;

    const discountAmount = subtotal * savedDiscountPercent;
    const total = subtotal + delivery - discountAmount;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    discountEl.textContent = `-$${discountAmount.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        massage('Order Placed Successfully! Thank you for shopping with us.', 'success');
        const order = {
            id: Date.now(),
            name: fullName.value,
            email: user.email,
            phone: phone.value,
            address: address.value,
            paymentMethod: method,
            orderDate: new Date(),
            orderStatus: 'pending',
            orderTotal: total,
            orderItems: cart
        };
        createOrder(order);
        localStorage.removeItem(user.email);
        localStorage.removeItem('appliedDiscount');

        window.location.hash = `#payment?orderId=${order.id}`;
    });
}

initCheckout();