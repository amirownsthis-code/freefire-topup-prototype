document.addEventListener('DOMContentLoaded', () => {
    // Banner configuration for 3-Panel Split Carousel
    const banners = [
        {
            full: "images/naruto-banner.png",
            left: "images/sale-banner-left-side.png",
            right: "images/sale-banner-right-side.png"
        },
        {
            full: "images/sale-banner.png",
            left: "images/naruto-banner-left-side.png",
            right: "images/naruto-banner-right-side.png"
        }
    ];

    let active = 0;
    let autoPlayTimer = null;
    let loggedInPlayerId = localStorage.getItem('garena_logged_in_user_id') || null;
    let selectedItem = null; // { name, price, amount }
    let selectedPaymentMethod = null; // { name, priceModifier }
    let currentTab = 'purchase';

    const centerImg = document.getElementById("centerImg");
    const leftImg = document.getElementById("leftImg");
    const rightImg = document.getElementById("rightImg");
    const carouselEl = document.querySelector(".carousel");
    const dots = document.querySelectorAll(".carousel-dots .dot");
    const playerIdInput = document.getElementById('player-id');
    const loginWarningText = document.getElementById('loginWarningText');

    function renderBanners(nextIndex) {
        centerImg.src = banners[nextIndex].full;
        leftImg.src = banners[nextIndex].left;
        rightImg.src = banners[nextIndex].right;

        dots.forEach((dot, idx) => {
            if (idx === nextIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    function switchBanner(targetIndex = null) {
        const next = targetIndex !== null ? targetIndex : (active === 0 ? 1 : 0);
        if (next === active && targetIndex !== null) return;

        // Apply smooth fade transition across all 3 panels (left, center, right)
        carouselEl.classList.add("switching");

        setTimeout(() => {
            renderBanners(next);
            active = next;
            carouselEl.classList.remove("switching");
        }, 250);
    }

    renderBanners(active);

    function startAutoplay() {
        stopAutoplay();
        autoPlayTimer = setInterval(() => {
            switchBanner();
        }, 3000);
    }

    function stopAutoplay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    startAutoplay();

    document.getElementById("prevBtn").addEventListener("click", () => {
        switchBanner();
        startAutoplay();
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
        switchBanner();
        startAutoplay();
    });

    dots.forEach(dot => {
        dot.addEventListener("click", (e) => {
            const index = parseInt(e.target.getAttribute("data-index"));
            switchBanner(index);
            startAutoplay();
        });
    });

    // Handle Login with persistent LocalStorage state
    function handleLogin(id) {
        const cleanId = id ? id.trim() : '';
        if (!cleanId || !/^\d{10,11}$/.test(cleanId)) {
            alert('Please enter a valid 10 or 11 digit Player ID');
            triggerUnloginErrorState();
            return false;
        }
        loggedInPlayerId = cleanId;
        localStorage.setItem('garena_logged_in_user_id', loggedInPlayerId);

        applyLoggedInUI();
        closeAllModals();
        updateTabVisibility();
        return true;
    }

    function applyLoggedInUI() {
        if (!loggedInPlayerId) return;

        // Update Navbar DP Circle to Free Fire logo
        const defaultDpSvg = document.getElementById('defaultDpSvg');
        const userLoggedInDpImg = document.getElementById('userLoggedInDpImg');
        if (defaultDpSvg) defaultDpSvg.style.display = 'none';
        if (userLoggedInDpImg) userLoggedInDpImg.style.display = 'block';

        // Update Section 1 Header & Login Card UI
        const step1Title = document.getElementById('step1Title');
        const step1LogoutBtn = document.getElementById('step1LogoutBtn');
        if (step1Title) step1Title.textContent = 'Account';
        if (step1LogoutBtn) step1LogoutBtn.style.display = 'inline-flex';

        const loginBox = document.getElementById('login-box');
        if (loginBox) {
            loginBox.innerHTML = `
                <div class="user-account-details-box">
                    <img src="images/freefire-game-logo.png" alt="Avatar" class="user-account-avatar">
                    <div class="user-account-text">
                        <h4>Username: 『SRG』PATHAN¹</h4>
                        <p>Player ID: ${loggedInPlayerId}</p>
                    </div>
                </div>
            `;
        }

        const logoutBtn = document.getElementById('step1LogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                performLogout();
            });
        }

        // Update Redeem section for logged-in user
        const unloggedRedeemBox = document.getElementById('unloggedRedeemBox');
        const loggedInRedeemForm = document.getElementById('loggedInRedeemForm');
        if (unloggedRedeemBox) unloggedRedeemBox.style.display = 'none';
        if (loggedInRedeemForm) loggedInRedeemForm.style.display = 'flex';

        // Reveal Level-Up Package deals in Purchase section
        document.querySelectorAll('.logged-in-only').forEach(el => {
            el.style.display = 'block';
        });
    }

    // Auto-restore logged in state if user returns after successful payment
    if (loggedInPlayerId) {
        applyLoggedInUI();
    }

    function performLogout() {
        loggedInPlayerId = null;
        localStorage.removeItem('garena_logged_in_user_id');
        location.reload();
    }

    function triggerUnloginErrorState() {
        if (!loggedInPlayerId) {
            if (playerIdInput) {
                playerIdInput.classList.add('input-error');
            }
            if (loginWarningText) {
                loginWarningText.classList.add('active');
            }
        }
    }

    // Main section login button
    const btnPlayerLogin = document.getElementById('btn-player-login');
    if (btnPlayerLogin) {
        btnPlayerLogin.addEventListener('click', () => {
            const val = playerIdInput.value;
            handleLogin(val);
        });
    }

    // Profile DP Circle Header Click & Dropdown Menu Logic
    const navDpBtn = document.getElementById('navDpBtn');
    const dpDropdownMenu = document.getElementById('dpDropdownMenu');
    const redeemLoginBtn = document.getElementById('redeemLoginBtn');
    const navLoginModal = document.getElementById('navLoginModal');
    const closeNavModalBtn = document.getElementById('closeNavModalBtn');

    if (navDpBtn) {
        navDpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (loggedInPlayerId) {
                dpDropdownMenu.classList.toggle('active');
            } else {
                navLoginModal.classList.add('active');
            }
        });
    }

    document.addEventListener('click', () => {
        if (dpDropdownMenu) dpDropdownMenu.classList.remove('active');
    });

    if (redeemLoginBtn) {
        redeemLoginBtn.addEventListener('click', () => {
            navLoginModal.classList.add('active');
        });
    }

    if (closeNavModalBtn) {
        closeNavModalBtn.addEventListener('click', () => {
            navLoginModal.classList.remove('active');
        });
    }

    const modalBtnLogin = document.getElementById('modal-btn-login');
    if (modalBtnLogin) {
        modalBtnLogin.addEventListener('click', () => {
            const val = document.getElementById('modal-player-id').value;
            handleLogin(val);
        });
    }

    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    if (dropdownLogoutBtn) {
        dropdownLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performLogout();
        });
    }

    const dropdownHelpBtn = document.getElementById('dropdownHelpBtn');
    if (dropdownHelpBtn) {
        dropdownHelpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openHelpModal();
        });
    }

    // Help Center Modal
    const helpCenterBtn = document.getElementById('helpCenterBtn');
    const mainHelpIcon = document.getElementById('mainHelpIcon');
    const modalHelpIcon = document.getElementById('modalHelpIcon');
    const helpCenterModal = document.getElementById('helpCenterModal');
    const closeHelpModalBtn = document.getElementById('closeHelpModalBtn');
    const confirmHelpBtn = document.getElementById('confirmHelpBtn');

    function openHelpModal(e) {
        if (e) e.preventDefault();
        helpCenterModal.classList.add('active');
    }

    if (helpCenterBtn) helpCenterBtn.addEventListener('click', openHelpModal);
    if (mainHelpIcon) mainHelpIcon.addEventListener('click', openHelpModal);
    if (modalHelpIcon) modalHelpIcon.addEventListener('click', openHelpModal);

    if (closeHelpModalBtn) {
        closeHelpModalBtn.addEventListener('click', () => {
            helpCenterModal.classList.remove('active');
        });
    }

    if (confirmHelpBtn) {
        confirmHelpBtn.addEventListener('click', () => {
            helpCenterModal.classList.remove('active');
        });
    }

    // Buy Now Modal Logic
    const buyNowLoginModal = document.getElementById('buyNowLoginModal');
    const closeBuyNowModalBtn = document.getElementById('closeBuyNowModalBtn');
    const buynowModalLoginBtn = document.getElementById('buynow-modal-login-btn');

    if (closeBuyNowModalBtn) {
        closeBuyNowModalBtn.addEventListener('click', () => {
            buyNowLoginModal.classList.remove('active');
        });
    }

    if (buynowModalLoginBtn) {
        buynowModalLoginBtn.addEventListener('click', () => {
            const val = document.getElementById('buynow-player-id').value;
            if (handleLogin(val)) {
                proceedToCheckoutPage();
            }
        });
    }

    function closeAllModals() {
        if (navLoginModal) navLoginModal.classList.remove('active');
        if (helpCenterModal) helpCenterModal.classList.remove('active');
        if (buyNowLoginModal) buyNowLoginModal.classList.remove('active');
    }

    // See More / See Less Toggle Button for Level Up Packages
    const seeMoreBtn = document.getElementById('seeMoreBtn');
    const level30Card = document.getElementById('level30Card');

    if (seeMoreBtn && level30Card) {
        seeMoreBtn.addEventListener('click', () => {
            if (level30Card.style.display === 'none' || !level30Card.style.display) {
                level30Card.style.display = 'block';
                seeMoreBtn.innerHTML = 'See Less <i class="fa-solid fa-chevron-up"></i>';
            } else {
                level30Card.style.display = 'none';
                seeMoreBtn.innerHTML = 'See More <i class="fa-solid fa-chevron-down"></i>';
            }
        });
    }

    // Tab Switching Logic (Purchase vs Redeem)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const stepPaymentSection = document.getElementById('step-payment');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetEl = document.getElementById(`tab-${currentTab}`);
            if (targetEl) targetEl.classList.add('active');

            updateTabVisibility();
        });
    });

    function updateTabVisibility() {
        if (currentTab === 'redeem' && loggedInPlayerId) {
            if (stepPaymentSection) stepPaymentSection.style.display = 'none';
            if (channelNoticeBar) channelNoticeBar.style.display = 'none';
        } else {
            if (stepPaymentSection) stepPaymentSection.style.display = 'block';
            if (selectedItem && channelNoticeBar) channelNoticeBar.style.display = 'flex';
        }
    }

    // Confirm Prepaid Card Redeem Button
    const confirmRedeemBtn = document.getElementById('confirmRedeemBtn');
    if (confirmRedeemBtn) {
        confirmRedeemBtn.addEventListener('click', () => {
            const pwd = document.getElementById('prepaidPassword').value;
            if (!pwd || pwd.trim() === '') {
                alert('Please enter your Garena Prepaid Card Password.');
            } else {
                alert(`Redeem Successful for Player ID ${loggedInPlayerId}!`);
            }
        });
    }

    // ITEM SELECTION & UNSELECTION TOGGLE LOGIC
    const allSelectableItems = document.querySelectorAll('.diamond-card, .deal-card, .redeem-item');
    const channelNoticeBar = document.getElementById('channelNoticeBar');
    const noticeMethodName = document.getElementById('noticeMethodName');
    const summaryItemText = document.getElementById('summaryItemText');
    const paymentCards = document.querySelectorAll('.payment-card:not(.disabled)');

    const selectedItemPreview = document.getElementById('selectedItemPreview');

    function clearAllItemSelections() {
        allSelectableItems.forEach(i => i.classList.remove('selected'));
        if (channelNoticeBar) channelNoticeBar.classList.remove('active');
        selectedItem = null;
        if (summaryItemText) summaryItemText.textContent = '';
        if (selectedItemPreview) selectedItemPreview.style.display = 'none';

        paymentCards.forEach(card => {
            const priceTag = card.querySelector('.dynamic-price-tag');
            if (priceTag) priceTag.classList.remove('active');
        });

        updateCheckoutBar();
    }

    allSelectableItems.forEach(item => {
        item.addEventListener('click', () => {
            if (!loggedInPlayerId) {
                triggerUnloginErrorState();
            }

            if (item.classList.contains('selected')) {
                clearAllItemSelections();
                return;
            }

            allSelectableItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');

            const name = item.getAttribute('data-name') || 'Item';
            const price = item.getAttribute('data-price') || '50';
            const amount = item.getAttribute('data-amount') || name;

            selectedItem = { name, price, amount };

            if (summaryItemText) summaryItemText.textContent = amount;
            if (selectedItemPreview) selectedItemPreview.style.display = 'flex';

            paymentCards.forEach(card => {
                const priceTag = card.querySelector('.dynamic-price-tag');
                if (priceTag) {
                    priceTag.classList.add('active');
                    const valText = priceTag.querySelector('.item-val-text');
                    const priceVal = priceTag.querySelector('.price-val');
                    
                    if (valText) valText.textContent = amount;
                    if (priceVal) priceVal.textContent = `Rs. ${price}`;
                }
            });

            updateCheckoutBar();
        });
    });

    // Reset Selection Button
    const resetSelectionBtn = document.getElementById('resetSelectionBtn');
    if (resetSelectionBtn) {
        resetSelectionBtn.addEventListener('click', () => {
            clearAllItemSelections();
            paymentCards.forEach(c => c.classList.remove('selected'));
            selectedPaymentMethod = null;
            if (channelNoticeBar) channelNoticeBar.classList.remove('active');
            updateCheckoutBar();
        });
    }

    // PAYMENT SELECTION EFFECT
    paymentCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('selected')) {
                card.classList.remove('selected');
                selectedPaymentMethod = null;
                if (channelNoticeBar) channelNoticeBar.classList.remove('active');
                updateCheckoutBar();
                return;
            }

            paymentCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            const name = card.getAttribute('data-method');
            const priceModifier = card.getAttribute('data-price-modifier');

            selectedPaymentMethod = { name, priceModifier };

            if (noticeMethodName) {
                noticeMethodName.textContent = name;
            }

            if (channelNoticeBar) {
                channelNoticeBar.classList.add('active');
            }

            updateCheckoutBar();
        });
    });

    // Update Bottom Checkout Bar & Buy Now Button State
    const buyNowBtn = document.getElementById('buyNowBtn');
    const selectedTotalPrice = document.getElementById('selectedTotalPrice');

    function updateCheckoutBar() {
        if (!selectedTotalPrice || !buyNowBtn) return;
        if (selectedPaymentMethod && selectedItem) {
            selectedTotalPrice.innerHTML = `Total: <strong>Rs. ${selectedItem.price}</strong>`;
            buyNowBtn.classList.remove('disabled');
            buyNowBtn.classList.add('active');
        } else {
            selectedTotalPrice.innerHTML = `<span>Select Payment Method</span>`;
            buyNowBtn.classList.add('disabled');
            buyNowBtn.classList.remove('active');
        }
    }

    function proceedToCheckoutPage() {
        if (!selectedItem || !selectedPaymentMethod) return;

        localStorage.setItem('checkout_amount', selectedItem.amount);
        localStorage.setItem('checkout_price', selectedItem.price);
        localStorage.setItem('checkout_method', selectedPaymentMethod.name);
        localStorage.setItem('checkout_userId', loggedInPlayerId || '2312670066');

        window.location.href = `checkout.html?amount=${encodeURIComponent(selectedItem.amount)}&price=${selectedItem.price}&method=${encodeURIComponent(selectedPaymentMethod.name)}&userId=${loggedInPlayerId || '2312670066'}`;
    }

    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            if (!selectedItem) {
                alert('Please select a top-up amount or package first.');
                return;
            }

            if (!selectedPaymentMethod) {
                alert('Please select a payment method.');
                return;
            }

            if (!loggedInPlayerId) {
                buyNowLoginModal.classList.add('active');
            } else {
                proceedToCheckoutPage();
            }
        });
    }
});
