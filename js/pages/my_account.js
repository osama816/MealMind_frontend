import { massage } from '../Utilities/helpers.js';
import * as authService from '../services/auth_services.js';
import { getOrdersByUser } from '../services/checkout.js';

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
        logoutBtn.addEventListener('click', () => {
            authService.logout();
        });
    }

    // Load order history
    loadOrderHistory(currentUser.email);
}

async function loadOrderHistory(email) {
    const container = document.getElementById('order-history-list');
    if (!container) return;

    try {
        const orders = await getOrdersByUser(email);

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-(--sec-text)">
                    <i class="fa-solid fa-box-open text-5xl mb-4 opacity-30"></i>
                    <p>You haven't placed any orders yet.</p>
                    <a href="#products" class="inline-block mt-4 bg-(--primary) text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition">
                        Start Shopping
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="bg-(--main-bg) p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-(--border)">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-(--bg-cream) rounded-xl flex items-center justify-center text-(--primary) font-bold">
                        <i class="fa-solid fa-shopping-bag"></i>
                    </div>
                    <div>
                        <p class="font-bold text-(--main-text)">Order #${order.id || order.orderId || 'N/A'}</p>
                        <p class="text-sm text-(--sec-text)">${order.items?.length || 0} item(s) • ${new Date(order.date || order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-lg font-bold text-(--primary)">$${order.orderTotal || order.total || 0}</span>
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}">
                        ${order.status || 'Processing'}
                    </span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-(--sec-text)">
                <i class="fa-solid fa-triangle-exclamation text-5xl mb-4 text-red-400"></i>
                <p>Could not load your orders. Please try again later.</p>
            </div>
        `;
    }
}

initMyAccount();
