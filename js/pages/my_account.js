import { massage } from '../Utilities/helpers.js';
import * as authService from '../services/auth_services.js';
import { getUserOrder } from '../services/checkout.js';

export function initMyAccount() {
    const currentUser = authService.getCurrentUser();

    // If not logged in, redirect to login
    if (!currentUser) {
        massage('Please log in to view your account.', 'error');
        setTimeout(() => { location.hash = '#login'; }, 500);
        return;
    }

    // Populate profile info
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');

    if (nameEl) nameEl.textContent = currentUser.fullName || 'User';
    if (emailEl) emailEl.textContent = currentUser.email || '';

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            authService.logout();
            location.hash = '#home';
        };
    }

    // Load order history
    loadOrderHistory();
}

async function loadOrderHistory() {
    const container = document.getElementById('order-history-list');
    if (!container) return;

    try {
        const orders = await getUserOrder();

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-(--sec-text)">
                    <div class="w-20 h-20 bg-(--primary)/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fa-solid fa-box-open text-3xl text-(--primary) opacity-50"></i>
                    </div>
                    <p class="text-lg font-bold">No orders found yet</p>
                    <p class="text-sm opacity-60 mb-8">Looks like you haven't placed any orders.</p>
                    <a href="#products" class="inline-block bg-(--primary) text-white font-bold py-4 px-10 rounded-2xl hover:brightness-110 active:scale-95 transition shadow-lg">
                        Browse Menu
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.sort((a, b) => b.id - a.id).map(order => `
            <div class="bg-(--main-bg) p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-(--border) hover:border-(--primary)/30 transition-all duration-300">
                <div class="flex items-center gap-5">
                    <div class="w-16 h-16 bg-(--primary) rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                        <i class="fa-solid fa-utensils text-2xl"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <p class="font-black text-lg text-(--main-text)">#${order.id}</p>
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.orderStatus === 'delivered' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}">
                                ${order.orderStatus || 'Processing'}
                            </span>
                        </div>
                        <p class="text-xs font-bold uppercase tracking-tighter text-(--sec-text)">
                            ${new Date(order.orderDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • ${order.orderItems?.length || 0} items
                        </p>
                    </div>
                </div>
                <div class="flex items-center justify-between w-full md:w-auto gap-10">
                    <div class="text-right">
                        <p class="text-xs font-bold text-(--sec-text) uppercase mb-0.5">Total Amount</p>
                        <p class="text-2xl font-black text-(--primary)">$${order.orderTotal.toFixed(2)}</p>
                    </div>
                    <a href="#payment?orderId=${order.id}" class="w-12 h-12 bg-(--sec-bg) rounded-2xl flex items-center justify-center text-(--main-text) border border-(--border) hover:border-(--primary) hover:text-(--primary) transition shadow-sm">
                        <i class="fa-solid fa-chevron-right"></i>
                    </a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-(--sec-text)">
                <i class="fa-solid fa-triangle-exclamation text-5xl mb-4 text-red-500 opacity-50"></i>
                <p class="font-bold">Oops! Something went wrong</p>
                <p class="text-sm">We couldn't retrieve your order history.</p>
            </div>
        `;
    }
}

initMyAccount();
