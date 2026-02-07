import * as productServices from '../services/product_services.js';
import * as checkout from '../services/checkout.js';
import { generateInvoice } from '../services/invoice_service.js';

const chatbot = document.getElementById('chat-window');
const messages = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const closeChat = document.getElementById('closeChat');
const openChat = document.getElementById('openChat');
const clearChatBtn = document.getElementById('clearChat');
const sendMsgBtn = document.getElementById('sendMsgBtn');

// Toggle Chat Visibility
function toggleChat() {
    if (chatbot.classList.contains('hidden')) {
        chatbot.classList.remove('hidden');
        chatbot.classList.add('flex');
    } else {
        chatbot.classList.remove('flex');
        chatbot.classList.add('hidden');
    }
}

if (closeChat) closeChat.addEventListener('click', toggleChat);
if (openChat) openChat.addEventListener('click', toggleChat);

// Clear Chat Logic
if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
        messages.innerHTML = `
            <div class="flex justify-start animate-slide-up">
                <div class="bg-(--main-text) text-(--main-bg) px-5 py-4 rounded-3xl max-w-[92%] text-sm leading-relaxed shadow-lg border border-(--border)">
                    <p class="font-black mb-2 uppercase tracking-tighter text-[10px]" style="color: var(--primary);">MealMind Assistant</p>
                    <p class="font-bold opacity-90">Chat cleared! 👋 How else can I help you find your next meal?</p>
                </div>
            </div>
        `;
    });
}

// Add Message to UI
function addMessage(text, from = 'bot') {
    if (!messages) return;
    messages.innerHTML += `
      <div class="flex ${from === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="${from === 'user' ? 'bg-(--main-bg) text-(--main-text)' : 'bg-(--primary) text-(--main-bg)'} px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm transition-all duration-300">
          ${text}
        </div>
      </div>`;
    messages.scrollTop = messages.scrollHeight;
}

// Intent Detection
function getIntent(message) {
    const m = message.toLowerCase().trim();

    const searchKeywords = ['find', 'search', 'get', 'show me', 'i want', 'looking for', 'check'];
    const foodKeywords = ['biryani', 'chicken', 'pizza', 'burger', 'pasta', 'salad', 'pancake', 'egg', 'fish', 'meat', 'spicy', 'veg'];

    if (searchKeywords.some(k => m.includes(k)) || foodKeywords.some(k => m.includes(k))) return 'search';

    if (/\b(hi|hello|hey|start|welcome)\b/.test(m)) return 'greeting';
    if (/\b(product|products|item|items|shop|buying|category|categories|menu)\b/.test(m)) return 'products';
    if (/\b(price|prices|cost|how much)\b/.test(m)) return 'price';
    if (/\b(shipping|ship|delivery|time|arrive)\b/.test(m)) return 'shipping';
    if (/\b(orders|order|order status|order history|invoice|payment|my orders)\b/.test(m)) return 'order';
    if (/\b(thank|thanks)\b/.test(m)) return 'thanks';

    return 'search';
}

// Smart Search Implementation
async function performSmartSearch(query) {
    const products = await productServices.getAllProducts();
    const categories = await productServices.getAllCategories();
    const q = query.toLowerCase().trim();

    // Check if query is a category name
    const categoryMatch = categories.find(c => c.name.toLowerCase() === q);
    if (categoryMatch) {
        const catProducts = products.filter(p => p.categoryId === categoryMatch.id);
        return catProducts.slice(0, 3).map(p => ({ ...p, categoryName: categoryMatch.name, score: 999 }));
    }

    return products.map(p => {
        let score = 0;
        const name = p.name.toLowerCase();
        const desc = p.description.toLowerCase();
        const style = (p.style || "").toLowerCase();
        const category = categories.find(c => c.id === p.categoryId)?.name.toLowerCase() || "";

        if (name === q) score += 100;
        if (name.includes(q)) score += 50;
        if (desc.includes(q)) score += 20;
        if (category.includes(q)) score += 30;
        if (style.includes(q)) score += 25;

        return { ...p, score, categoryName: category };
    })
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
}

// Bot Reply Logic
async function botReply(userMessage) {
    const intent = getIntent(userMessage);

    switch (intent) {
        case 'greeting':
            return "Hello! I'm Chef Bot. 👨‍🍳 I can help you find the perfect meal or check your order status. What's on your mind?";

        // Search result layout refined
        case 'search':
            const results = await performSmartSearch(userMessage);
            if (results.length > 0) {
                let html = `<div class="space-y-3">
                    <p class="font-bold text-(--main-text) mb-2 italic">I found these great matches for you:</p>`;
                results.forEach(p => {
                    const img = p.mainImage.startsWith('../assets/') ? p.mainImage.substring(3) : p.mainImage;
                    html += `
                        <a href="index.html#product?id=${p.id}" class="block group">
                            <div class="flex items-center gap-4 bg-(--main-bg) p-3 rounded-2xl border border-(--border) hover:border-(--primary) transition shadow-sm active:scale-95">
                                <div class="w-14 h-14 shrink-0 bg-white rounded-xl p-1 shadow-inner overflow-hidden">
                                    <img src="${img}" class="w-full h-full object-contain rounded-lg" alt="${p.name}">
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-[10px] font-black uppercase tracking-widest text-(--primary) mb-0.5">${p.categoryName}</p>
                                    <p class="text-sm font-bold text-(--main-text) truncate">${p.name}</p>
                                    <div class="flex items-center justify-between mt-1">
                                        <p class="text-xs font-black text-(--primary)">$${p.price}</p>
                                        <span class="text-[10px] font-bold text-(--sec-text) group-hover:text-(--primary) transition-colors">View Details →</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    `;
                });
                html += `</div>`;
                return html;
            }
            return "I couldn't find exactly what you're looking for. 🧐 Try searching for things like 'Breakfast', 'Pasta', or 'Pizza'!";

        case 'products':
            const categories = await productServices.getAllCategories();
            if (!categories.length) return "Sorry, I couldn't fetch the menu right now.";

            let categoryHtml = `<div class="space-y-2">
                        <p class="font-bold mb-2">Explore our Menu categories:</p>
                        <div class="grid grid-cols-2 gap-2">`;
            categories.forEach(cat => {
                categoryHtml += `
                            <button data-category-id="${cat.id}" data-category-name="${cat.name}" class="category-btn bg-(--main-bg) hover:bg-(--primary) hover:text-white text-(--main-text) px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-(--border)">
                                ${cat.name}
                            </button>
                        `;
            });
            categoryHtml += `</div></div>`;
            return categoryHtml;

        case 'price':
            return "Our meals range from $40 to $150. You can search for a specific dish to see its price! 🏷️";

        case 'shipping':
            return `
                <div class="bg-(--main-bg) p-4 rounded-2xl border border-(--border) space-y-2">
                    <p class="font-bold text-(--primary) flex items-center gap-2 italic">
                        <i class="fas fa-truck-fast"></i> Delivery Info
                    </p>
                    <p class="text-xs font-medium">Standard Delivery: <b>35-45 mins</b></p>
                    <div class="h-px bg-(--border) my-2"></div>
                    <p class="text-[10px] text-(--sec-text) uppercase font-black tracking-widest leading-tight">
                        Free delivery on orders over <span class="text-(--primary)">$50</span>!
                    </p>
                </div>
            `;
        case 'order':
            const order = await checkout.getUserOrder();
            if (!order || (Array.isArray(order) && order.length === 0)) {
                return "You don't have any orders yet. 🛒";
            }
            const userOrder = Array.isArray(order) ? order : [order];
            let orderHtml = `<div class="space-y-3">
                        <p class="font-medium mb-1">Here are your orders:</p>`;
            userOrder.forEach(item => {
                orderHtml += `
                <div class="space-y-3 bg-(--main-bg) p-3 rounded-2xl border border-(--border)">
                    <p class="font-bold text-(--main-text) flex items-center gap-2">
                        <span class="bg-green-500/10 text-green-500 p-1 rounded-full text-[10px]">📦</span>
                        Found your order!
                    </p>
                    <div class="text-xs space-y-2 opacity-80">
                        <p class="flex justify-between"><span>Order ID:</span> <span class="font-bold">#${item.id}</span></p>
                        <p class="flex justify-between"><span>Total:</span> <span class="text-(--primary) font-black">$${item.orderTotal}</span></p>
                        <p class="flex justify-between"><span>Status:</span> <span class="capitalize px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full font-bold">${item.orderStatus}</span></p>
                    </div>
                    <button data-order-id="${item.id}" class="download-invoice-btn w-full mt-2 bg-(--primary) text-white py-3 px-4 rounded-xl text-xs font-bold hover:opacity-90 transition flex items-center justify-center gap-2 active:scale-95 shadow-lg">
                        <i class="fa-solid fa-file-pdf"></i> Download Invoice
                    </button>
                </div>`;
            });
            orderHtml += `</div>`;
            return orderHtml;

        case 'thanks':
            return "You're welcome! Happy shopping! 🌟";

        default:
            return "I didn't quite catch that. 🤔 You can search for dishes or check your orders!";
    }
}

// Action Handlers
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';

    setTimeout(async () => {
        const reply = await botReply(text);
        addMessage(reply, 'bot');
    }, 500);
}

if (sendMsgBtn) sendMsgBtn.addEventListener('click', sendMessage);
if (userInput) userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Delegation for dynamic buttons
if (messages) {
    messages.addEventListener('click', async (e) => {
        const invoiceBtn = e.target.closest('.download-invoice-btn');
        if (invoiceBtn) {
            const orderId = invoiceBtn.getAttribute('data-order-id');
            const order = await checkout.getUserOrderById(orderId);
            if (order) generateInvoice(order);
            return;
        }

        const catBtn = e.target.closest('.category-btn');
        if (catBtn) {
            const categoryName = catBtn.getAttribute('data-category-name');
            addMessage(`I want to see items from ${categoryName}`, 'user');
            const reply = await botReply(categoryName);
            setTimeout(() => addMessage(reply, 'bot'), 500);
        }
    });
}
