const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.getElementById('close-menu');
const mobileMenuLinks = mobileMenu?.querySelectorAll('a');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    const hideMenu = () => {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
    };

    closeMenu?.addEventListener('click', hideMenu);

    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) hideMenu();
    });

    mobileMenuLinks?.forEach(link => {
        link.addEventListener('click', hideMenu);
    });
}

// Search functionality placeholder (can be expanded if needed)
const searchBtn = document.querySelector('button .fa-search')?.parentElement;
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        console.log('Search clicked');
        // Implement search overlay if needed
    });
}
