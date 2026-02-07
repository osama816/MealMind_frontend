import { getCurrentUserMail } from '../services/auth_services.js';

// get all orders from localStorage
export async function getAllOrders() {
    const rawOrders = localStorage.getItem('order');
    try {
        return rawOrders ? JSON.parse(rawOrders) : [];
    } catch (e) {
        console.error("Failed to parse orders from localStorage", e);
        return [];
    }
}

// get user orders
export async function getUserOrder() {
    const userMail = getCurrentUserMail();
    if (!userMail) return [];

    const allOrders = await getAllOrders();
    return allOrders.filter(o => o.email === userMail);
}

// get user order by id
export async function getUserOrderById(id) {
    const userOrders = await getUserOrder();
    return userOrders.find(o => o.id == id) || null;
}

// create order
export async function createOrder(order) {
    const allOrders = await getAllOrders();
    allOrders.push(order);
    localStorage.setItem('order', JSON.stringify(allOrders));
}
