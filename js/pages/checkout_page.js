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
       <div
       class="rounded-3xl p-6 flex items-center justify-between shadow-lg border border-(--border) transition-all duration-300 hover:scale-[1.01]" style="background-color: var(--sec-bg);">
       <div class="flex items-center gap-6">
           <div class="w-24 h-24 rounded-2xl p-2 shrink-0 border border-(--border)" style="background-color: var(--main-bg);">
               <img src="${item.mainImage}" alt="${item.name}"
                   class="w-full h-full object-contain rounded-lg">
           </div>
           <div>
               <h3 class="font-black text-lg" style="color: var(--main-text);">${item.name}</h3>
               <p class="text-xs font-bold uppercase tracking-widest" style="color: var(--sec-text);">${item.price} x ${item.qty}</p>
           </div>
       </div>
       <div class="flex items-center gap-8">
           <div class="flex items-center gap-4 bg-(--primary) text-white rounded-full px-5 py-2 shadow-lg">
               <span class="font-black text-sm">${item.qty}</span>
           </div>
           <span class="text-2xl font-black" style="color: var(--primary);"> $${(item.price * item.qty).toFixed(2)}</span>
       </div>
   </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const delivery = 10;

    const discountAmount = subtotal * savedDiscountPercent;
    const total = subtotal + delivery - discountAmount;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    discountEl.textContent = `-$${discountAmount.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;

    form.addEventListener('submit', async (e) => {
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
        await createOrder(order);

        // Clear cart for the user
        await cartServices.updateCart(user.email, []);
        localStorage.removeItem('appliedDiscount');
        window.location.hash = `#payment?orderId=${order.id}`;
    });
}

initCheckout();