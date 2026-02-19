// 1. 服務介紹功能已移除

// 預算計算功能已移除

// 3. 系統群組折疊與搜尋過濾
document.addEventListener('DOMContentLoaded', function () {
    const toggles = document.querySelectorAll('.group-toggle');
    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            const content = btn.nextElementSibling;
            if (content) content.classList.toggle('collapsed', expanded);
        });
    });

    const searchInput = document.getElementById('systems-search');
    const clearBtn = document.getElementById('clear-search');

    function filterSystems() {
        const q = (searchInput.value || '').trim().toLowerCase();
        const groups = document.querySelectorAll('.system-group');
        groups.forEach(group => {
            const items = group.querySelectorAll('ul li');
            let anyVisible = false;
            items.forEach(li => {
                const txt = li.textContent.trim().toLowerCase();
                const match = q === '' || txt.indexOf(q) !== -1;
                li.classList.toggle('hidden', !match);
                if (match) anyVisible = true;
            });
            group.hidden = !anyVisible;
            // 展開有結果的群組
            const toggle = group.querySelector('.group-toggle');
            const content = group.querySelector('.group-content');
            if (anyVisible) {
                if (toggle) toggle.setAttribute('aria-expanded', 'true');
                if (content) content.classList.remove('collapsed');
            }
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterSystems);
    if (clearBtn) clearBtn.addEventListener('click', function () { if (searchInput) { searchInput.value = ''; filterSystems(); searchInput.focus(); } });

    // Accessibility: allow Enter/Space to toggle group-toggle buttons
    toggles.forEach(btn => {
        btn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
    // enhance product-toggle keyboard support
    const productToggles = document.querySelectorAll('.product-toggle');
    productToggles.forEach(pt => {
        pt.setAttribute('tabindex', '0');
        pt.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pt.click(); } });
    });

    // decorate list items with icon and small description (generic)
    const listItems = document.querySelectorAll('.system-group .group-content ul li');
    listItems.forEach(li => {
        // avoid double-inject
        if (li.querySelector('.card-icon')) return;
        const icon = document.createElement('i');
        const iconClass = li.getAttribute('data-icon') || 'fa-check-circle';
        icon.className = `fas ${iconClass} card-icon`;
        icon.setAttribute('aria-hidden', 'true');
        const body = document.createElement('div'); body.className = 'card-body';
        const name = document.createElement('span'); name.className = 'sys-name'; name.textContent = li.textContent.trim();
        const desc = document.createElement('small'); desc.className = 'sys-desc'; desc.textContent = '系統功能/用途說明';
        body.appendChild(name); body.appendChild(desc);
        li.textContent = ''; // clear existing
        li.appendChild(icon); li.appendChild(body);
    });
});

// 4. Navbar 產品資訊下拉行為（單一開啟，點擊外側關閉）
document.addEventListener('click', function (e) {
    const isToggle = e.target.closest('.product-toggle');
    const allItems = document.querySelectorAll('.nav-products .product-item');

    if (isToggle) {
        const item = isToggle.closest('.product-item');
        const open = item.classList.contains('open');
        allItems.forEach(i => i.classList.remove('open'));
        if (!open) item.classList.add('open');
        return;
    }

    // 點擊外部則關閉所有
    if (!e.target.closest('.nav-products')) {
        allItems.forEach(i => i.classList.remove('open'));
    }
});

// 5. 聯絡我們 FAB 與 LINE 深層連動
(function () {
    const fab = document.getElementById('contact-fab');
    const openBtn = document.getElementById('contact-open');
    const closeBtn = document.getElementById('contact-close');
    const panel = document.getElementById('contact-panel');
    const openLineBtn = document.getElementById('open-line');

    const LINE_ID = '@747uykhu'; // 已由使用者提供的 LINE ID

    function togglePanel(show) {
        if (!fab) return;
        if (show) {
            fab.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
        } else {
            fab.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
        }
    }

    if (openBtn) openBtn.addEventListener('click', function (e) { e.stopPropagation(); togglePanel(true); });
    // Navbar 右側聯絡按鈕也開啟同一個面板
    const navContact = document.getElementById('nav-contact-open');
    if (navContact) navContact.addEventListener('click', function (e) { e.stopPropagation(); togglePanel(true); });
    if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); togglePanel(false); });
    // 點擊面板內部不關閉
    if (panel) panel.addEventListener('click', function (e) { e.stopPropagation(); });
    // 點擊外部關閉
    document.addEventListener('click', function () { togglePanel(false); });

    if (openLineBtn) openLineBtn.addEventListener('click', function () {
        if (!LINE_ID || LINE_ID === 'YOUR_LINE_ID') {
            alert('請先將 js/main.js 中的 LINE_ID 改成你的 LINE 官方帳號 ID，或聯絡管理員設定。');
            return;
        }

        // 官方帳號使用 https://line.me/R/ti/p/@ID
        // 這是最標準的官方帳號加入好友連結
        const webUrl = 'https://line.me/R/ti/p/' + encodeURIComponent(LINE_ID);
        window.location.href = webUrl;
    });
})();

// 6. Hero 輪播：三張圖片，每張顯示約 1500ms（1.5s），帶淡入淡出
(function () {
    // Hero 已改為三張並列圖片，關閉舊的單張自動輪播邏輯。
    const carousel = document.getElementById('hero-carousel');
    if (!carousel) return;
    console.log('carousel: showing 3 images side-by-side (autoplay disabled)');
})();
// Contact form fallback handling and simple privacy-friendly analytics
(function () {
    // simple analytics: local pageview counter
    try {
        const key = '__pl_pageviews__';
        const n = parseInt(localStorage.getItem(key) || '0', 10) + 1;
        localStorage.setItem(key, String(n));
        console.log('analytics: local pageviews =', n);
    } catch (e) { /* ignore */ }

    // contact form fallback inside contact-panel (if present)
    const panel = document.getElementById('contact-panel');
    if (panel) {
        // inject a simple fallback form if not present
        if (!document.getElementById('contact-form')) {
            const form = document.createElement('form');
            form.id = 'contact-form';
            form.innerHTML = '\n                <label>姓名<br><input name="name" type="text" required></label><br>\n                <label>Email<br><input name="email" type="email" required></label><br>\n                <label>訊息<br><textarea name="message" rows="3" required></textarea></label><br>\n                <div style="display:flex;gap:8px;margin-top:6px;"><button type="submit" class="btn btn-primary">送出</button><button type="button" id="contact-cancel" class="btn">取消</button></div>\n            ';
            panel.appendChild(form);
            // handle submit -> open mailto fallback
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const fd = new FormData(form);
                const name = fd.get('name') || '';
                const email = fd.get('email') || '';
                const message = fd.get('message') || '';
                const subject = encodeURIComponent('網站聯絡：' + name);
                const body = encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message);
                window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
            });
            document.getElementById('contact-cancel').addEventListener('click', function () { panel.parentElement.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); });
        }
    }
})();

// Plausible analytics consent handling
(function () {
    const banner = document.getElementById('analytics-consent');
    const accept = document.getElementById('analytics-accept');
    const decline = document.getElementById('analytics-decline');
    if (!banner || !accept || !decline) return;
    const key = 'pl_consent';
    const choice = localStorage.getItem(key);
    if (!choice) banner.style.display = 'block';
    function loadPlausible() {
        if (window.plausible) return;
        const s = document.createElement('script');
        s.src = 'https://plausible.io/js/plausible.js';
        s.defer = true;
        s.setAttribute('data-domain', location.hostname);
        document.head.appendChild(s);
    }
    accept.addEventListener('click', function () { localStorage.setItem(key, 'yes'); banner.style.display = 'none'; loadPlausible(); });
    decline.addEventListener('click', function () { localStorage.setItem(key, 'no'); banner.style.display = 'none'; });
    if (choice === 'yes') loadPlausible();
})();
// 7. Website Protection Measures
(function () {
    // Disable right-click
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // Disable copy, cut, paste
    document.addEventListener('copy', function (e) { e.preventDefault(); });
    document.addEventListener('cut', function (e) { e.preventDefault(); });
    document.addEventListener('paste', function (e) { e.preventDefault(); });

    // Disable drag
    document.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // Disable developer tools shortcuts
    document.addEventListener('keydown', function (e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (Mac: Meta+Option+I), Ctrl+Shift+J (Mac: Meta+Option+J), Ctrl+U (View Source)
        if ((e.ctrlKey || e.metaKey) && (e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
            e.preventDefault();
            return false;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S, Ctrl+P (Save, Print) - optional but requested "entire site protection"
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            return false;
        }
    });

    // Disable selection (JS backup for CSS)
    document.addEventListener('selectstart', function (e) {
        e.preventDefault();
    });
})();
