# 🍛 MealMind - Authentic Indian Food Delivery

**🔗 Live Demo:** [mealsmind.vercel.app](https://mealsmind.vercel.app)

MealMind is a premium, fast, and responsive Single Page Application (SPA) designed for authentic Indian food delivery. Built with a modern architecture using **Vanilla JavaScript (ES6+ Modules)** and **Tailwind CSS v4**, it offers a seamless ordering experience from browsing traditional curries to generating PDF invoices.

![Banner](https://img.shields.io/badge/Status-Project_Completed-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-HTML--CSS--JS-blue?style=for-the-badge)
![Design](https://img.shields.io/badge/Design-Premium--Food--Theme-orange?style=for-the-badge)

---

## 🇪🇬 النسخة العربية (Arabic Version)

### 🍛 MealMind - تجربة طعام هندي أصيل
MealMind هو تطبيق ويب عصري وسريع (SPA) مخصص لتوصيل الطعام الهندي الأصيل. تم بناؤه باستخدام تقنيات الويب الحديثة ليوفر تجربة مستخدم سلسة، بدءاً من تصفح القائمة الغنية بالأطباق التقليدية (كالبرياني والكاري) وصولاً إلى إتمام الطلب وإصدار الفواتير بصيغة PDF.

**المميزات الرئيسية:**
- **قائمة طعام تفاعلية:** عرض ديناميكي للأطباق الهندية مع ميزات التصفية والبحث.
- **تجربة SPA سريعة:** تنقل فوري بين الصفحات بدون إعادة تحميل المتصفح.
- **نظام سمات متطور:** دعم كامل للوضع الليلي (Dark Mode) والوضع النهاري.
- **إدارة السلة والطلبات:** إضافة وتعديل الطلبات في السلة في الوقت الفعلي.
- **فواتير PDF:** إنشاء فواتير احترافية للطلبات تلقائياً.
- **دردشة ذكية (Chatbot):** مساعد ذكي مدمج لمساعدة المستخدمين.

---

## ✨ Key Features

### 🎞️ Smooth Page Transitions
- **Dynamic Entry Animations**: Content slides in smoothly from the side and top when navigating between pages.
- **Staggered Delays**: Menu items and reviews appear sequentially with a cascading effect for a premium feel.
- **SPA-like Feel**: Fast navigation using a custom router that loads components without full page refreshes.

### 📱 Responsive & Premium Header
- **Fixed Navigation**: Header stays at the top for easy access.
- **Advanced Mobile Menu**: A fully animated, responsive side-navigation for smaller screens.
- **Interactive Search**: An animated search bar that expands and focuses for a better UX.

### 🌓 Advanced Theme Engine
- **Dark/Light Mode**: Full support for both themes with instant toggling.
- **System Memory**: Remembers user theme preferences using `localStorage`.

### 🛍️ Core Food Delivery Functionality
- **Dynamic Menu Engine**: Fetching and rendering traditional Indian dishes from JSON APIs.
- **Shopping Cart**: Real-time cart management (Add/Remove/Update).
- **Checkout & Invoices**: Integrated checkout flow with PDF invoice generation using `jsPDF`.
- **User Authentication**: Secure registration and login flow with encrypted storage.
- **AI Chatbot**: Integrated support bot for order tracking and assistance.

---

## 🛠️ Tech Stack & Tools

| Technology | Usage |
| :--- | :--- |
| **HTML5** | Semantic structure for all pages and components. |
| **Tailwind CSS v4** | Modern, utility-first styling with high performance. |
| **JavaScript (ES6+)** | Pure JS logic with modular architecture. |
| **Tailwind CLI** | Built-in compiler for optimized CSS output. |
| **LocalStorage** | Persistent data for Cart, Auth, and Theme. |
| **jsPDF** | Client-side dynamic PDF generation for invoices. |

---

## 📁 Project Architecture

```bash
MealMind/
├── html/          # Reusable component templates
├── js/
│   ├── Utilities/ # Helper functions (Theme, Validation, Helpers)
│   ├── config/    # Routes and API configurations
│   ├── api/       # Fetch wrappers and API endpoints
│   ├── services/  # Business logic (Auth, Products, Cart)
│   ├── pages/     # Page-specific initialization logic
│   └── main.js    # Entry point & Global router
├── css/
│   ├── main.css   # Source CSS with Tailwind directives & Animations
│   └── output.css # Minified production CSS (generated)
├── assets/        # Images, fonts, and static media
├── package.json   # Build scripts and dependencies
└── README.md      # You are here!
```

---

## 🚀 Development & Deployment

### Run Locally
To compile the Tailwind CSS with auto-watch for development:
```bash
npm run dev
```

### Production Build
To generate a minified, production-ready CSS file:
```bash
npm run build
```

---

## 📐 Architecture Principles
1. **Separation of Concerns**: Logic (Services), UI (Pages), and Data (API) are kept independent.
2. **Standardization**: Folder names and imports are case-sensitive and follow naming conventions.
3. **Consistency**: Global variables are used for all colors, spacing, and typography.
