import { logout } from '../services/auth_services.js';

export function renderAuthButtons() {
    const desktopContainer = document.getElementById('auth-buttons-desktop');
    const mobileContainer = document.getElementById('auth-buttons-mobile');

    // Support legacy container if it exists
    const legacyContainer = document.getElementById('auth-buttons');
    const containers = [desktopContainer, mobileContainer, legacyContainer].filter(c => c !== null);

    if (containers.length === 0) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    containers.forEach(container => {
        if (currentUser) {
            container.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-sm font-medium opacity-70 hidden md:block text-(--main-text)">
                        Hi, ${currentUser.fullName.split(' ')[0]}
                    </span>
                    <button class="logout-btn w-full bg-(--primary) text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-(--primary) border border-transparent hover:border-(--primary) transition">
                        Logout
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <a href="#login"
                    class="block text-center bg-(--primary) text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-(--primary) border border-transparent hover:border-(--primary) transition">
                    Login
                </a>
            `;
        }
    });

    // Add event listeners to all logout buttons
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            logout();
        });
    });
}
