import {
  getAllProducts,
  getAllReviews,
  renderProducts,
  makeLink
} from "../services/product_services.js";

// Fade In Fade Out Slider
let images = document.querySelectorAll(".slider img");
let currentIndex = 0;
function nextImage() {
  if (images.length < 2) return;
  images[currentIndex].classList.replace("opacity-100", "opacity-0");
  currentIndex = (currentIndex + 1) % images.length;
  images[currentIndex].classList.replace("opacity-0", "opacity-100");
}
if (images.length >= 2) {
  setInterval(nextImage, 1500);
}

const tickerContainer = document.getElementById("newsTicker");
const tickerWrapper = document.getElementById("tickerWrapper");

if (tickerContainer && tickerWrapper) {
  // 1. Prepare for infinite loop by cloning items
  // We clone the entire set of items to ensure seamless transition
  const originalItems = Array.from(tickerWrapper.children);
  originalItems.forEach((item) => {
    const clone = item.cloneNode(true);
    tickerWrapper.appendChild(clone);
  });

  // 2. Animation Variables
  let scrollPos = 0;
  let isPaused = false;
  const speed = 0.8;
  /*
   * Main animation loop
   */
  function step() {
    if (!isPaused) {
      scrollPos -= speed;

      // Reset when the first half (original set) has completely scrolled out
      const resetPoint = tickerWrapper.scrollWidth / 2;

      if (Math.abs(scrollPos) >= resetPoint) {
        scrollPos = 0;
      }

      tickerWrapper.style.transform = `translateX(${scrollPos}px)`;
    }
    requestAnimationFrame(step);
  }

  // 3. Interaction Listeners
  // Pause on hover for better readability
  tickerContainer.addEventListener("mouseenter", () => (isPaused = true));
  tickerContainer.addEventListener("mouseleave", () => (isPaused = false));

  // Mobile touch support
  tickerContainer.addEventListener("touchstart", () => (isPaused = true), {
    passive: true,
  });
  tickerContainer.addEventListener("touchend", () => (isPaused = false), {
    passive: true,
  });

  // 4. Start Animation
  requestAnimationFrame(step);
}


// --- Dynamic Content Initialization ---
async function initHome() {
  try {
    const allProducts = await getAllProducts();
    const allReviews = await getAllReviews();

    if (!allProducts || allProducts.length === 0) {
      console.warn("No products found in data/product.json");
      return;
    }

    // 1. Popular Products (Top 3)
    const popularContainer = document.getElementById("popular-products-container");
    if (popularContainer) {
      const topRated = [...allProducts]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);
      topRated.forEach((product) => {
        const imagePath = product.mainImage.startsWith('../assets/') ? product.mainImage.substring(3) : product.mainImage;
        popularContainer.innerHTML += `
          <div class="text-center">
            <div class="popular-ellipse mb-6">
              <img src="${imagePath}" alt="${product.name}">
            </div>
            <h3 class="font-bold text-xl mb-2 text-(--main-text)">${product.name}</h3>
            <a href="#product?id=${product.id}" class="text-(--primary) font-bold hover:underline">Order Now ></a>
          </div>`;
      });
    }

    // 2. Regular Menu (6 Products)
    const regularContainer = document.getElementById("regular-menu-container");
    if (regularContainer) {
      const regularMenu = allProducts.slice(0, 6);
      await renderProducts(regularMenu, regularContainer);
    }

  } catch (error) {
    console.error("Failed to initialize home page content:", error);
  }
}

// Kick off dynamic loading
initHome();
