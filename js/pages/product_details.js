import * as productServices from '../services/product_services.js';
import { massage } from '../Utilities/helpers.js';
import { getCurrentUser } from '../services/auth_services.js';
import * as cartServices from '../services/cart_services.js';

// Global state
const currentUser = getCurrentUser();
let selectedRating = 0;
let currentProduct = null;

/**
 * Initialization
 */
async function init() {
    const productId = productServices.getProductId();

    if (!productId) {
        window.location.hash = '#products';
        return;
    }

    try {
        currentProduct = await productServices.getProductById(productId);
        if (!currentProduct) {
            window.location.hash = '#products';
            return;
        }

        // Parallel rendering for speed
        await Promise.all([
            renderHeroSection(currentProduct),
            renderReviewsSection(productId),
            renderRelatedProducts(currentProduct.categoryId)
        ]);

        // Event Setup
        setupGallery(currentProduct);
        setupQuantitySelector();
        setupReviewModal(productId);
        setupAddToCart(currentProduct);

    } catch (error) {
        console.error("Initialization failed:", error);
        massage("Failed to load product details", "error");
    }
}

/**
 * Render Hero Section (Gallery + Info)
 */
function renderHeroSection(product) {
    // Basic Info
    document.getElementById('product-name').innerText = product.name;
    document.getElementById('product-description').innerText = product.description;
    document.getElementById('main-image').src = product.mainImage;

    const categoryTag = document.getElementById('category-tag');
    if (categoryTag) categoryTag.innerText = product.categoryName || "Gourmet Selection";

    // Dynamic Rating
    const ratingContainer = document.getElementById('rating-container');
    if (ratingContainer) {
        ratingContainer.innerHTML = `
            <div class="rating" style="--rating: ${product.rating}"></div>
            <span class="font-bold text-lg">${product.rating}</span>
        `;
    }

    // Price & Discount
    const priceContainer = document.getElementById('product-price');
    const discountBadge = document.getElementById('discount-badge');

    if (product.discountPercentage) {
        const discountedPrice = productServices.calculateDiscountedPrice(product.price, product.discountPercentage);
        priceContainer.innerHTML = `
            <span class="text-4xl md:text-5xl font-black text-(--primary)">$${parseInt(discountedPrice)}</span>
            <span class="text-xl md:text-2xl text-(--sec-text) line-through opacity-50">$${parseInt(product.price)}</span>
        `;
        if (discountBadge) {
            discountBadge.innerText = `-${product.discountPercentage}% OFF`;
            discountBadge.classList.remove('hidden');
        }
    } else {
        priceContainer.innerHTML = `<span class="text-4xl md:text-5xl font-black text-(--main-text)">$${parseInt(product.price)}</span>`;
        if (discountBadge) discountBadge.classList.add('hidden');
    }

    // Sizes
    const sizesContainer = document.getElementById('sizes');
    if (sizesContainer) {
        sizesContainer.innerHTML = '';
        product.sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.className = "px-6 py-3 rounded-xl border border-(--border) font-bold transition-all hover:border-(--primary) hover:text-(--primary) size-option";
            btn.innerText = size;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-option').forEach(b => b.classList.remove('bg-(--primary)', 'text-white', 'border-(--primary)', 'selected'));
                btn.classList.add('bg-(--primary)', 'text-white', 'border-(--primary)', 'selected');
            });
            sizesContainer.appendChild(btn);
        });
        // Auto-select first size
        if (sizesContainer.firstChild) sizesContainer.firstChild.click();
    }
}

/**
 * Gallery Management (Simplified: Only one image)
 */
function setupGallery(product) {
    const mainImg = document.getElementById('main-image');
    if (!mainImg) return;

    // No slider needed as per user request
    mainImg.src = product.mainImage;
}

/**
 * Reviews rendering
 */
async function renderReviewsSection(productId) {
    const countHeader = document.getElementById('reviews-count-header');
    const countSummary = document.getElementById('reviews-count-summary');
    const avgRatingEl = document.getElementById('avg-rating');
    const totalStars = document.getElementById('rating-stars-total');
    const container = document.getElementById('review-container');

    const reviews = await productServices.getReviewsByProductId(productId) || [];
    const count = reviews.length;

    if (countHeader) countHeader.innerText = count;
    if (countSummary) countSummary.innerText = count;

    if (avgRatingEl && count > 0) {
        const avg = (reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1);
        avgRatingEl.innerText = avg;
        if (totalStars) totalStars.innerHTML = `<div class="rating" style="--rating: ${avg}"></div>`;
    }

    if (container) {
        container.innerHTML = count === 0 ? `<p class="text-(--sec-text) italic py-10 text-center">No reviews yet. Be the first to try it!</p>` : '';
        reviews.slice(0, 4).forEach((rev, idx) => {
            container.insertAdjacentHTML('beforeend', renderReviewCard(rev, idx));
        });
    }

    const loadMore = document.getElementById('load_more');
    if (loadMore) loadMore.classList.toggle('hidden', count <= 4);
}

function renderReviewCard(review, index) {
    const delay = (index * 0.1).toFixed(1);
    return `
        <div class="bg-(--sec-bg) border border-(--border) p-8 rounded-3xl animate-side shadow-sm" style="animation-delay: ${delay}s">
            <div class="flex justify-between items-start mb-4">
                <div class="space-y-1">
                    <div class="rating" style="--rating: ${review.rating}"></div>
                    <h4 class="font-black text-lg">${review.userName}</h4>
                </div>
                <span class="text-xs text-(--sec-text) font-bold uppercase tracking-widest">${formatDate(review.createdAt)}</span>
            </div>
            <p class="text-(--sec-text) text-lg italic leading-relaxed">"${review.comment}"</p>
        </div>
    `;
}

/**
 * Interactions
 */
function setupQuantitySelector() {
    const minus = document.getElementById('qty-minus');
    const plus = document.getElementById('qty-plus');
    const val = document.getElementById('qty-val');
    if (!minus || !plus || !val) return;

    minus.addEventListener('click', () => {
        let current = parseInt(val.innerText);
        if (current > 1) val.innerText = current - 1;
    });
    plus.addEventListener('click', () => {
        val.innerText = parseInt(val.innerText) + 1;
    });
}

function setupAddToCart(product) {
    const btn = document.getElementById('add-to-cart');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const sizeOption = document.querySelector('.size-option.selected');
        const qty = parseInt(document.getElementById('qty-val').innerText);

        if (!sizeOption) {
            massage("Please select a size", "error");
            return;
        }

        const userKey = currentUser ? currentUser.email : 'guest';
        const cart = await cartServices.getCart(userKey);

        if (cart.find(p => p.productId == product.id && p.size === sizeOption.innerText)) {
            massage("Already in cart with this size", "warning");
            return;
        }

        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            discountPercentage: product.discountPercentage,
            mainImage: product.mainImage,
            qty: qty,
            size: sizeOption.innerText,
            userEmail: userKey
        });

        await cartServices.updateCart(userKey, cart);
        massage("Successfully added to cart!", "success");
    });
}

function setupReviewModal(productId) {
    const modal = document.getElementById('review-modal');
    const openBtn = document.getElementById('open-review-modal');
    const closeBtns = [document.getElementById('close-modal'), document.getElementById('cancel-review'), document.getElementById('modal-backdrop')];
    const starBtns = document.querySelectorAll('.star-btn');
    const form = document.getElementById('review-form');

    const toggle = (show) => {
        modal.classList.toggle('hidden', !show);
        if (!show) {
            document.getElementById('review-comment').value = '';
            selectedRating = 0;
            starBtns.forEach(b => b.classList.replace('text-yellow-400', 'text-(--border)'));
        }
    };

    if (openBtn) openBtn.addEventListener('click', () => {
        if (!currentUser) {
            massage("Please login to write a review", "error");
            return;
        }
        toggle(true);
    });
    closeBtns.forEach(btn => btn?.addEventListener('click', () => toggle(false)));

    starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedRating = parseInt(btn.dataset.rating);
            starBtns.forEach((b, i) => {
                const isActive = i < selectedRating;
                b.classList.toggle('text-yellow-400', isActive);
                b.classList.toggle('text-(--border)', !isActive);
            });
        });
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const comment = document.getElementById('review-comment').value.trim();

        if (!selectedRating) {
            massage("Please select a star rating", "error");
            return;
        }
        if (!comment) {
            massage("Please write a comment", "error");
            return;
        }

        const review = {
            productId,
            userName: currentUser.fullName,
            rating: selectedRating,
            comment,
            createdAt: new Date().toISOString()
        };

        await productServices.addReview(review);
        toggle(false);
        massage("Thank you for your review!", "success");
        renderReviewsSection(productId);
    });
}

async function renderRelatedProducts(categoryId) {
    const container = document.getElementById('product-container');
    if (!container) return;

    const products = await productServices.getProductsByCategoryId(categoryId);
    const productId = productServices.getProductId();

    // Filter out current product and take top 3
    const related = products
        .filter(p => p.id != productId)
        .slice(0, 3);

    container.innerHTML = '';

    if (related.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-(--sec-text) italic">No related products found.</p>';
        return;
    }

    const cardsHtml = await Promise.all(related.map(async (p, i) => {
        const category = await productServices.getCategoryById(p.categoryId);
        const anim = i % 2 === 0 ? 'animate-side' : 'animate-top';
        const delay = (i * 0.1).toFixed(1);
        return productServices.renderProductCard(p, category.name, anim, delay);
    }));

    container.innerHTML = cardsHtml.join('');
}

function formatDate(dateStr) {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Start
init();
