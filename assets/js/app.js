document.addEventListener('DOMContentLoaded', () => {
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    const formatPrice = (value) =>
        `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))}đ`;

    const escapeHtml = (value) =>
        String(value).replace(/[&<>"']/g, (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        }[character]));

    // ---------------------------------------------------------
    // HERO BACKGROUND SLIDER
    // ---------------------------------------------------------
    const heroSlides = $$('[data-hero-slide]');
    const heroDots = $$('[data-hero-dot]');
    let heroIndex = 0;
    let heroTimer = null;

    const showHeroSlide = (index) => {
        heroSlides.forEach((img, i) => img.classList.toggle('is-active', i === index));
        heroDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        heroIndex = index;
    };

    const nextHeroSlide = () => {
        showHeroSlide((heroIndex + 1) % heroSlides.length);
    };

    const startHeroTimer = () => {
        clearInterval(heroTimer);
        if (heroSlides.length > 1) {
            heroTimer = setInterval(nextHeroSlide, 5500);
        }
    };

    if (heroSlides.length) {
        heroDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                showHeroSlide(i);
                startHeroTimer();
            });
        });
        startHeroTimer();
    }

    // ---------------------------------------------------------
    // MOBILE MENU
    // ---------------------------------------------------------
    const menuToggle = $('[data-menu-toggle]');
    const mobileMenu = $('[data-mobile-menu]');

    menuToggle?.addEventListener('click', () => {
        const open = document.body.classList.toggle('menu-open');
        menuToggle.setAttribute('aria-expanded', String(open));
        mobileMenu?.classList.toggle('is-open', open);
    });

    $$('[data-mobile-menu] a').forEach((link) => {
        link.addEventListener('click', () => {
            document.body.classList.remove('menu-open');
            mobileMenu?.classList.remove('is-open');
            menuToggle?.setAttribute('aria-expanded', 'false');
        });
    });

    // ---------------------------------------------------------
    // ACTIVE NAVIGATION
    // ---------------------------------------------------------
    const navLinks = $$('.nav-link');

    const sections = $$('main section[id]');
    if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visible) return;

            navLinks.forEach((link) => {
                link.classList.toggle(
                    'active',
                    link.getAttribute('href') === `#${visible.target.id}`,
                );
            });
        }, {
            rootMargin: '-28% 0px -60% 0px',
            threshold: [0.05, 0.2, 0.4],
        });

        sections.forEach((section) => observer.observe(section));
    }

    // ---------------------------------------------------------
    // MENU FILTERS + MOOD SHORTCUT
    // ---------------------------------------------------------
    const filterButtons = $$('.filter-button');
    const menuCards = $$('[data-category]');
    const drinkBlocks = $$('[data-category-block="drink"]');

    const applyFilter = (filter = 'all') => {
        filterButtons.forEach((button) => {
            button.classList.toggle(
                'active',
                button.dataset.filter === filter,
            );
        });

        menuCards.forEach((card) => {
            const visible =
                filter === 'all' ||
                card.dataset.category === filter;

            card.hidden = !visible;
            card.classList.toggle('is-filtered-out', !visible);
        });

        drinkBlocks.forEach((block) => {
            const visible = filter === 'all' || filter === 'drink';
            block.hidden = !visible;
        });
    };

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            applyFilter(button.dataset.filter || 'all');
        });
    });

    $$('[data-mood]').forEach((button) => {
        button.addEventListener('click', () => {
            const mood = button.dataset.mood || 'all';
            applyFilter(mood);
            document.querySelector('#menu')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    });

    // ---------------------------------------------------------
    // LIVE CLOCK + LIMITED BATCH STATE
    // ---------------------------------------------------------
    // Mô phỏng "mẻ xôi" theo chu kỳ 5 phút, tính toán thuần từ
    // đồng hồ trình duyệt (deterministic, không random, không âm,
    // ổn định khi reload). Mỗi chu kỳ 5 phút = 1 mẻ:
    //   - Đầu chu kỳ: mẻ vừa mở, còn nhiều phần.
    //   - Cuối chu kỳ: mẻ gần hết / hết, hiện trạng thái rõ ràng.
    const liveTime = $('[data-live-time]');
    const liveHeld = $('[data-live-held]');
    const liveLeft = $('[data-live-left]');
    const liveSummary = $('[data-live-summary]');
    const liveProgress = $('[data-live-progress]');
    const liveCountdown = $('[data-live-countdown]');
    const liveNextWrap = $('[data-live-next-wrap]');
    const liveSoldOut = $('[data-live-sold-out]');
    const liveNextTime = $('[data-live-next-time]');
    const liveCtaLabel = $('[data-live-cta-label]');
    const liveOrderButton = $('[data-live-order]');
    const LIVE_TOTAL = 50;
    const LIVE_BATCH_MS = 5 * 60 * 1000;
    const LIVE_BASE_HELD = 6;

    let liveSoldOutState = false;

    const renderLive = () => {
        const now = new Date();

        if (liveTime) {
            liveTime.textContent = now.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        }

        const nowMs = now.getTime();
        const slotStart = Math.floor(nowMs / LIVE_BATCH_MS) * LIVE_BATCH_MS;
        const slotEnd = slotStart + LIVE_BATCH_MS;
        const fraction = Math.min(1, (nowMs - slotStart) / LIVE_BATCH_MS);

        const held = Math.min(
            LIVE_TOTAL,
            Math.round(LIVE_BASE_HELD + fraction * (LIVE_TOTAL - LIVE_BASE_HELD)),
        );
        const left = Math.max(0, LIVE_TOTAL - held);
        const percent = Math.min(100, Math.round((held / LIVE_TOTAL) * 100));
        const soldOut = left <= 0;

        if (liveHeld) liveHeld.textContent = held;
        if (liveLeft) liveLeft.textContent = left;
        if (liveSummary) liveSummary.textContent = `${held} / ${LIVE_TOTAL}`;
        if (liveProgress) liveProgress.style.width = `${percent}%`;

        const remainingMs = Math.max(0, slotEnd - nowMs);
        const remainingSec = Math.ceil(remainingMs / 1000);
        const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
        const ss = String(remainingSec % 60).padStart(2, '0');
        if (liveCountdown) liveCountdown.textContent = `${mm}:${ss}`;

        const nextBatchTime = new Date(slotEnd).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
        if (liveNextTime) liveNextTime.textContent = nextBatchTime;

        if (soldOut !== liveSoldOutState) {
            liveSoldOutState = soldOut;

            if (liveNextWrap) liveNextWrap.hidden = soldOut;
            if (liveSoldOut) liveSoldOut.hidden = !soldOut;

            if (liveCtaLabel) {
                liveCtaLabel.textContent = soldOut
                    ? 'Báo tôi khi mẻ mới ra lò'
                    : 'Giữ phần nóng ngay';
            }

            liveOrderButton?.classList.toggle('is-sold-out', soldOut);
        }
    };

    renderLive();
    window.setInterval(renderLive, 1000);

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------
    const searchOverlay = $('[data-search-overlay]');
    const searchButton = $('[data-search-button]');
    const searchClose = $('[data-search-close]');
    const searchInput = $('[data-search-input]');
    const searchResults = $('[data-search-results]');

    const closeSearch = () => {
        document.body.classList.remove('search-open');
        searchOverlay?.classList.remove('is-open');
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.innerHTML = '';
    };

    searchButton?.addEventListener('click', () => {
        document.body.classList.add('search-open');
        searchOverlay?.classList.add('is-open');
        window.setTimeout(() => searchInput?.focus(), 50);
    });

    searchClose?.addEventListener('click', closeSearch);

    searchOverlay?.addEventListener('click', (event) => {
        if (event.target === searchOverlay) closeSearch();
    });

    const searchableItems = $$('[data-search-item]').map((card) => {
        const button = $('[data-add-to-cart]', card);
        return {
            name: $('h3', card)?.textContent.trim() || '',
            text: card.dataset.searchItem || '',
            price: button?.dataset.price || '0',
            image: button?.dataset.image || '',
            id: button?.dataset.id || '',
        };
    });

    const renderSearchResults = (query) => {
        if (!searchResults) return;

        const normalized = query.trim().toLocaleLowerCase('vi-VN');

        if (!normalized) {
            searchResults.innerHTML = '';
            return;
        }

        const matches = searchableItems
            .filter((item) =>
                `${item.name} ${item.text}`.toLocaleLowerCase('vi-VN')
                    .includes(normalized),
            )
            .slice(0, 6);

        if (!matches.length) {
            searchResults.innerHTML = `
                <div class="search-empty">
                    Chưa tìm thấy món phù hợp. Thử “xôi gà”, “sữa” hoặc “nước mơ”.
                </div>
            `;
            return;
        }

        searchResults.innerHTML = matches.map((item) => `
            <button
                type="button"
                class="search-result-item"
                data-search-add
                data-id="${escapeHtml(item.id)}"
                data-name="${escapeHtml(item.name)}"
                data-price="${escapeHtml(item.price)}"
                data-image="${escapeHtml(item.image)}"
            >
                ${item.image ? `<img src="${escapeHtml(item.image)}" alt="">` : ''}
                <span>
                    <strong>${escapeHtml(item.name)}</strong>
                    <small>${formatPrice(item.price)}</small>
                </span>
                <b>+</b>
            </button>
        `).join('');
    };

    searchInput?.addEventListener('input', (event) => {
        renderSearchResults(event.target.value);
    });

    // ---------------------------------------------------------
    // CART
    // ---------------------------------------------------------
    const CART_KEY = 'xoi-hong-cart-v2';
    const cartDrawer = $('[data-cart-drawer]');
    const cartButton = $('[data-cart-button]');
    const cartClose = $('[data-cart-close]');
    const drawerBackdrop = $('[data-drawer-backdrop]');
    const cartItems = $('[data-cart-items]');
    const cartCount = $('[data-cart-count]');
    const cartTotal = $('[data-cart-total]');

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        if (!Array.isArray(cart)) cart = [];
    } catch {
        cart = [];
    }

    const saveCart = () => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    };

    const showToast = (message) => {
        const toast = $('[data-toast]');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('is-visible');

        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 2800);
    };

    const openCart = () => {
        document.body.classList.add('drawer-open');
        cartDrawer?.classList.add('is-open');
        drawerBackdrop?.classList.add('is-open');
    };

    const closeCart = () => {
        document.body.classList.remove('drawer-open');
        cartDrawer?.classList.remove('is-open');
        drawerBackdrop?.classList.remove('is-open');
    };

    const renderCart = () => {
        const totalQuantity = cart.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );

        const total = cart.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0,
        );

        if (cartCount) cartCount.textContent = totalQuantity;
        if (cartTotal) cartTotal.textContent = formatPrice(total);

        if (!cartItems) return;

        if (!cart.length) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <strong>Giỏ hàng đang trống.</strong>
                    <span>Chọn một phần xôi nóng hoặc đồ uống để bắt đầu.</span>
                </div>
            `;
            return;
        }

        cartItems.innerHTML = cart.map((item) => `
            <article class="cart-item">
                ${item.image ? `<img src="${escapeHtml(item.image)}" alt="">` : ''}
                <div class="cart-item-info">
                    <strong>${escapeHtml(item.name)}</strong>
                    <small>${formatPrice(item.price)}</small>
                    <div class="cart-quantity">
                        <button type="button" data-cart-action="decrease" data-id="${escapeHtml(item.id)}">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-cart-action="increase" data-id="${escapeHtml(item.id)}">+</button>
                    </div>
                </div>
                <button
                    type="button"
                    class="cart-remove"
                    data-cart-action="remove"
                    data-id="${escapeHtml(item.id)}"
                    aria-label="Xóa ${escapeHtml(item.name)}"
                >×</button>
            </article>
        `).join('');
    };

    const addToCart = (item) => {
        if (!item.id || !item.name) return;

        const existing = cart.find((entry) => entry.id === item.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: Number(item.price),
                image: item.image || '',
                quantity: 1,
            });
        }

        saveCart();
        renderCart();
        showToast(`${item.name} đã được thêm vào giỏ.`);
    };

    const addFromDataset = (element) => {
        addToCart({
            id: element.dataset.id,
            name: element.dataset.name,
            price: element.dataset.price,
            image: element.dataset.image,
        });
    };

    $$('[data-add-to-cart]').forEach((button) => {
        button.addEventListener('click', () => addFromDataset(button));
    });

    searchResults?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-search-add]');
        if (!button) return;
        addFromDataset(button);
        closeSearch();
        openCart();
    });

    cartItems?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cart-action]');
        if (!button) return;

        const item = cart.find((entry) => entry.id === button.dataset.id);
        if (!item) return;

        if (button.dataset.cartAction === 'increase') {
            item.quantity += 1;
        }

        if (button.dataset.cartAction === 'decrease') {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                cart = cart.filter((entry) => entry.id !== item.id);
            }
        }

        if (button.dataset.cartAction === 'remove') {
            cart = cart.filter((entry) => entry.id !== item.id);
        }

        saveCart();
        renderCart();
    });

    cartButton?.addEventListener('click', openCart);
    cartClose?.addEventListener('click', closeCart);
    drawerBackdrop?.addEventListener('click', closeCart);

    $('[data-live-order]')?.addEventListener('click', () => {
        if (liveSoldOutState) {
            showToast('Mẻ hiện tại đã hết. Chúng tôi sẽ mở mẻ mới đúng khung giờ tiếp theo.');
            return;
        }

        const hotDish = $('[data-add-to-cart]');
        if (hotDish) {
            addFromDataset(hotDish);
            openCart();
        } else {
            document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // ---------------------------------------------------------
    // CHECKOUT DEMO FLOW
    // ---------------------------------------------------------
    const checkoutModal = $('[data-checkout-modal]');
    const checkoutButton = $('[data-checkout-button]');
    const checkoutForm = $('[data-checkout-form]');
    const checkoutSummary = $('[data-checkout-summary]');

    const openCheckout = () => {
        if (!cart.length) {
            showToast('Hãy chọn ít nhất một món trước khi đặt.');
            return;
        }

        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );

        if (checkoutSummary) {
            checkoutSummary.innerHTML = `
                <span>${cart.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span>
                <strong>${formatPrice(total)}</strong>
            `;
        }

        closeCart();
        checkoutModal?.classList.add('is-open');
        checkoutModal?.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeCheckout = () => {
        checkoutModal?.classList.remove('is-open');
        checkoutModal?.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    checkoutButton?.addEventListener('click', openCheckout);
    $$('[data-checkout-close]').forEach((button) => {
        button.addEventListener('click', closeCheckout);
    });

    const orderSuccessModal = $('[data-order-success-modal]');
    const orderSuccessName = $('[data-order-success-name]');
    const orderSuccessCode = $('[data-order-success-code]');
    const orderSuccessTotal = $('[data-order-success-total]');
    const orderSuccessEta = $('[data-order-success-eta]');
    const orderSuccessPayment = $('[data-order-success-payment]');
    const orderSuccessPaymentNote = $('[data-order-success-payment-note]');

    const PAYMENT_LABELS = {
        cod: 'Thanh toán khi nhận hàng (COD)',
        bank: 'Chuyển khoản ngân hàng',
        ewallet: 'Ví điện tử (Momo / ZaloPay)',
    };

    const PAYMENT_NOTES = {
        cod: 'Vui lòng chuẩn bị đúng số tiền khi nhận xôi. Chúng tôi sẽ liên hệ qua số điện thoại bạn đã cung cấp nếu cần xác nhận thêm.',
        bank: 'Thông tin số tài khoản sẽ được gửi qua số điện thoại bạn đã cung cấp trong ít phút.',
        ewallet: 'Mã QR thanh toán sẽ được gửi qua số điện thoại bạn đã cung cấp trong ít phút.',
    };

    const openOrderSuccess = ({ name, code, total, eta, payment }) => {
        if (orderSuccessName) orderSuccessName.textContent = name;
        if (orderSuccessCode) orderSuccessCode.textContent = code;
        if (orderSuccessTotal) orderSuccessTotal.textContent = formatPrice(total);
        if (orderSuccessEta) orderSuccessEta.textContent = eta;
        if (orderSuccessPayment) orderSuccessPayment.textContent = PAYMENT_LABELS[payment] || PAYMENT_LABELS.cod;
        if (orderSuccessPaymentNote) orderSuccessPaymentNote.textContent = PAYMENT_NOTES[payment] || PAYMENT_NOTES.cod;

        orderSuccessModal?.classList.add('is-open');
        orderSuccessModal?.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeOrderSuccess = () => {
        orderSuccessModal?.classList.remove('is-open');
        orderSuccessModal?.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    $$('[data-order-success-close]').forEach((button) => {
        button.addEventListener('click', closeOrderSuccess);
    });

    const saveOrderHistory = (order) => {
        try {
            const raw = window.localStorage.getItem('xoi-hong-order-history');
            const history = raw ? JSON.parse(raw) : [];
            history.unshift(order);
            window.localStorage.setItem(
                'xoi-hong-order-history',
                JSON.stringify(history.slice(0, 20)),
            );
        } catch (error) {
            /* localStorage unavailable, ignore silently */
        }
    };

    const getOrderHistory = () => {
        try {
            const raw = window.localStorage.getItem('xoi-hong-order-history');
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            return [];
        }
    };

    let lastOrderCode = null;

    // ---------------------------------------------------------
    // ORDER STATUS TRACKING (demo, dựa trên thời gian đặt đơn)
    // ---------------------------------------------------------
    const orderStatusModal = $('[data-order-status-modal]');
    const orderStatusCode = $('[data-order-status-code]');
    const orderStatusTime = $('[data-order-status-time]');
    const orderStatusTotal = $('[data-order-status-total]');
    const orderStatusItems = $('[data-order-status-items]');
    const statusSteps = ['received', 'preparing', 'delivering', 'completed'];

    const getStatusStepIndex = (createdAt) => {
        const elapsedMin = (Date.now() - new Date(createdAt).getTime()) / 60000;
        if (elapsedMin < 2) return 0;
        if (elapsedMin < 8) return 1;
        if (elapsedMin < 20) return 2;
        return 3;
    };

    const openOrderStatus = (code) => {
        const history = getOrderHistory();
        const order = code
            ? history.find((entry) => entry.code === code)
            : history[0];

        if (!order) {
            showToast('Chưa có đơn hàng nào để theo dõi.');
            return;
        }

        if (orderStatusCode) orderStatusCode.textContent = `Đơn ${order.code}`;
        if (orderStatusTime) {
            orderStatusTime.textContent = new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        if (orderStatusTotal) orderStatusTotal.textContent = formatPrice(order.total);

        const currentIndex = getStatusStepIndex(order.createdAt);
        $$('[data-status-step]').forEach((step) => {
            const stepIndex = statusSteps.indexOf(step.dataset.statusStep);
            step.classList.toggle('is-done', stepIndex < currentIndex);
            step.classList.toggle('is-active', stepIndex === currentIndex);
        });

        if (orderStatusItems) {
            orderStatusItems.innerHTML = (order.items || []).map((item) => `
                <div class="order-status-item">
                    <span>${escapeHtml(item.name)} × ${item.quantity}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
            `).join('');
        }

        orderStatusModal?.classList.add('is-open');
        orderStatusModal?.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeOrderStatus = () => {
        orderStatusModal?.classList.remove('is-open');
        orderStatusModal?.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    $$('[data-order-status-close]').forEach((button) => {
        button.addEventListener('click', closeOrderStatus);
    });

    $('[data-order-track-open]')?.addEventListener('click', () => {
        closeOrderSuccess();
        openOrderStatus(lastOrderCode);
    });

    $('[data-account-track-open]')?.addEventListener('click', () => {
        closeAccount();
        openOrderStatus(null);
    });

    $('[data-phone-input]')?.addEventListener('input', (event) => {
        event.target.classList.remove('has-error');
        const phoneError = $('[data-phone-error]');
        if (phoneError) phoneError.hidden = true;
    });

    checkoutForm?.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!cart.length) {
            closeCheckout();
            showToast('Giỏ hàng trống, vui lòng chọn món trước khi đặt.');
            return;
        }

        const formData = new FormData(checkoutForm);
        const name = (formData.get('name') || '').toString().trim();
        const phoneRaw = (formData.get('phone') || '').toString().trim();
        const address = (formData.get('address') || '').toString().trim();
        const payment = (formData.get('payment') || 'cod').toString();
        const phoneDigits = phoneRaw.replace(/[\s.-]/g, '');
        const isValidVietnamesePhone = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phoneDigits);

        const phoneInput = $('[data-phone-input]');
        const phoneError = $('[data-phone-error]');

        if (!name || !address || !phoneDigits) {
            showToast('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ.');
            return;
        }

        if (!isValidVietnamesePhone) {
            phoneInput?.classList.add('has-error');
            if (phoneError) phoneError.hidden = false;
            phoneInput?.focus();
            return;
        }

        phoneInput?.classList.remove('has-error');
        if (phoneError) phoneError.hidden = true;

        const orderCode = `XH${Date.now().toString().slice(-6)}`;

        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );

        const etaMinutes = 25 + Math.floor(Math.random() * 15);
        const etaTime = new Date(Date.now() + etaMinutes * 60000)
            .toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        saveOrderHistory({
            code: orderCode,
            name,
            phone: phoneDigits,
            address,
            note: formData.get('note') || '',
            payment,
            items: cart,
            total,
            createdAt: new Date().toISOString(),
        });

        lastOrderCode = orderCode;

        addLoyaltyStamp();

        cart = [];
        saveCart();
        renderCart();
        checkoutForm.reset();
        closeCheckout();

        openOrderSuccess({
            name,
            code: orderCode,
            total,
            eta: `~${etaMinutes} phút (khoảng ${etaTime})`,
            payment,
        });
    });

    // ---------------------------------------------------------
    // ---------------------------------------------------------
    // ACCOUNT NOTICE / LOYALTY STAMP CARD
    // ---------------------------------------------------------
    const accountButton = $('[data-account-button]');
    const accountModal = $('[data-account-modal]');
    const loyaltyStampsEl = $('[data-loyalty-stamps]');
    const loyaltyStatusEl = $('[data-loyalty-status]');

    const LOYALTY_KEY = 'xoi-hong-loyalty-stamps';
    const LOYALTY_GOAL = 5;

    const getLoyaltyStamps = () => {
        const raw = Number(window.localStorage.getItem(LOYALTY_KEY) || '0');
        return Number.isFinite(raw) ? Math.max(0, Math.min(raw, LOYALTY_GOAL)) : 0;
    };

    const setLoyaltyStamps = (value) => {
        try {
            window.localStorage.setItem(LOYALTY_KEY, String(value));
        } catch (error) {
            /* localStorage unavailable, ignore */
        }
    };

    const renderLoyaltyCard = () => {
        if (!loyaltyStampsEl) return;
        const stamps = getLoyaltyStamps();

        loyaltyStampsEl.innerHTML = Array.from({ length: LOYALTY_GOAL }, (_, i) => `
            <span class="loyalty-stamp ${i < stamps ? 'is-filled' : ''}" aria-hidden="true">
                ${i < stamps ? '✓' : ''}
            </span>
        `).join('');

        if (loyaltyStatusEl) {
            if (stamps >= LOYALTY_GOAL) {
                loyaltyStatusEl.textContent = 'Đủ 5 tem rồi! Nói với nhân viên để nhận phần xôi miễn phí ở đơn tiếp theo.';
            } else if (stamps === 0) {
                loyaltyStatusEl.textContent = 'Đặt món đầu tiên để nhận tem nhé!';
            } else {
                loyaltyStatusEl.textContent = `Còn ${LOYALTY_GOAL - stamps} lần đặt nữa là được tặng 1 phần xôi miễn phí.`;
            }
        }
    };

    const addLoyaltyStamp = () => {
        const current = getLoyaltyStamps();
        const next = current >= LOYALTY_GOAL ? 0 : current + 1;
        setLoyaltyStamps(next);
        renderLoyaltyCard();
    };

    const openAccount = () => {
        renderLoyaltyCard();
        accountModal?.classList.add('is-open');
        accountModal?.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeAccount = () => {
        accountModal?.classList.remove('is-open');
        accountModal?.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    accountButton?.addEventListener('click', openAccount);
    $$('[data-account-close]').forEach((button) => {
        button.addEventListener('click', closeAccount);
    });

    // ---------------------------------------------------------
    // QUICK VIEW MODAL
    // ---------------------------------------------------------
    const quickviewModal = $('[data-quickview-modal]');
    const quickviewImage = $('[data-quickview-image]');
    const quickviewName = $('[data-quickview-name]');
    const quickviewDesc = $('[data-quickview-desc]');
    const quickviewPrice = $('[data-quickview-price]');
    const quickviewCategory = $('[data-quickview-category]');
    const quickviewQty = $('[data-quickview-qty]');
    const quickviewInput = $('[data-quickview-input]');
    const quickviewAdd = $('[data-quickview-add]');

    const categoryLabels = {
        savory: 'Xôi mặn',
        sweet: 'Xôi ngọt',
        light: 'Thanh nhẹ',
        drink: 'Đồ uống',
        combo: 'Combo ưu đãi',
    };

    let quickviewItem = null;
    let quickviewQuantity = 1;

    const openQuickview = (card) => {
        const button = $('[data-add-to-cart]', card);
        if (!button) return;

        quickviewItem = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: button.dataset.price,
            image: button.dataset.image,
        };
        quickviewQuantity = 1;

        const name = $('h3', card)?.textContent.trim() || '';
        const desc = $('p', card)?.textContent.trim() || '';
        const category = card.dataset.category || '';

        if (quickviewImage) {
            quickviewImage.src = quickviewItem.image;
            quickviewImage.alt = name;
        }
        if (quickviewName) quickviewName.textContent = name;
        if (quickviewDesc) quickviewDesc.textContent = desc;
        if (quickviewPrice) quickviewPrice.textContent = formatPrice(quickviewItem.price);
        if (quickviewCategory) quickviewCategory.textContent = categoryLabels[category] || 'Món xôi';
        if (quickviewQty) quickviewQty.textContent = quickviewQuantity;
        if (quickviewInput) quickviewInput.value = '';

        quickviewModal?.classList.add('is-open');
        quickviewModal?.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeQuickview = () => {
        quickviewModal?.classList.remove('is-open');
        quickviewModal?.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        quickviewItem = null;
    };

    $$('[data-quick-view]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const card = trigger.closest('article');
            if (card) openQuickview(card);
        });
    });

    $$('[data-quickview-close]').forEach((button) => {
        button.addEventListener('click', closeQuickview);
    });

    $('[data-quickview-increase]')?.addEventListener('click', () => {
        quickviewQuantity += 1;
        if (quickviewQty) quickviewQty.textContent = quickviewQuantity;
    });

    $('[data-quickview-decrease]')?.addEventListener('click', () => {
        quickviewQuantity = Math.max(1, quickviewQuantity - 1);
        if (quickviewQty) quickviewQty.textContent = quickviewQuantity;
    });

    quickviewAdd?.addEventListener('click', () => {
        if (!quickviewItem) return;

        for (let i = 0; i < quickviewQuantity; i += 1) {
            addToCart(quickviewItem);
        }

        closeQuickview();
        openCart();
    });

    // ---------------------------------------------------------
    // REVEAL
    // ---------------------------------------------------------
    const revealItems = $$('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.08 });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        closeSearch();
        closeCart();
        closeCheckout();
        closeAccount();
        closeQuickview();
        closeOrderSuccess();
        closeOrderStatus();
    });

    renderCart();
});
