/**
 * pos-app.js
 * 負責前端 UI 互動、購物車狀態、分頁及 Modal 顯示，對應 Tkinter 邏輯
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 狀態變數 ---
    let cart = [];
    let productList = [];
    let currentPage = 0;
    const itemsPerPage = 6;
    let receivedAmount = 0;
    let currentInput = "張媽媽滷味"; // 預設顯示文字

    // 用於品項管理的變數
    let selectedManageRowId = null;

    // --- DOM 元素：左側面板 ---
    const cartTbody = document.getElementById('cart-tbody');
    const totalPriceLabel = document.getElementById('total-price');
    const lblReceived = document.getElementById('lbl-received');
    const lblChange = document.getElementById('lbl-change');
    const infoLabel = document.getElementById('info-label');
    const btnCheckout = document.getElementById('btn-checkout');

    // --- DOM 元素：右側面板 ---
    const productsGrid = document.getElementById('products-grid');
    const pageLabel = document.getElementById('page-label');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const numBtns = document.querySelectorAll('.num-btn[data-val]');
    const btnClear = document.getElementById('btn-clear');
    const btnManageOpen = document.getElementById('btn-manage-open');

    // --- DOM 元素：結帳 Modal ---
    const modalCheckout = document.getElementById('modal-checkout');
    const checkoutTotal = document.getElementById('checkout-total');
    const checkoutReceived = document.getElementById('checkout-received');
    const checkoutChange = document.getElementById('checkout-change');
    const btnCheckoutConfirm = document.getElementById('btn-checkout-confirm');

    // --- DOM 元素：管理 Modal ---
    const modalManage = document.getElementById('modal-manage');
    const btnManageClose = document.getElementById('btn-manage-close');
    const manageTbody = document.getElementById('manage-tbody');
    const inputNewName = document.getElementById('new-product-name');
    const inputNewPrice = document.getElementById('new-product-price');
    const btnAddProduct = document.getElementById('btn-add-product');
    const btnDeleteProduct = document.getElementById('btn-delete-product');

    // ==========================================
    // 核心邏輯
    // ==========================================

    /**
     * 載入並渲染商品資料 (包含分頁處理)
     */
    function loadAndRenderProducts() {
        productList = PosData.getProducts();

        // 防呆：如果頁數超過範圍，拉回上一頁
        const maxPage = Math.max(0, Math.ceil(productList.length / itemsPerPage) - 1);
        if (currentPage > maxPage) {
            currentPage = maxPage;
        }

        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        const currentItems = productList.slice(start, end);

        const totalPages = Math.max(1, Math.ceil(productList.length / itemsPerPage));
        pageLabel.textContent = `${currentPage + 1} / ${totalPages}`;

        // 清空並重新渲染產品網格
        productsGrid.innerHTML = '';
        currentItems.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'product-btn';
            btn.innerHTML = `
                <span class="product-name">${item.name}</span>
                <span class="product-price">$${item.price}</span>
                <span class="product-stock">庫存:${item.stock}</span>
            `;
            // 點擊新增至購物車
            btn.addEventListener('click', () => addToCart(item.id));
            productsGrid.appendChild(btn);
        });
    }

    /**
     * 更新畫面顯示 (購物車清單、總價、結帳邏輯)
     */
    function refreshDisplay() {
        // 更新購物車 Table
        cartTbody.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.final_price;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>$${item.final_price.toLocaleString()}</td>
                <td><button class="btn-remove" data-idx="${index}"><i class="fas fa-trash"></i></button></td>
            `;
            cartTbody.appendChild(tr);
        });

        // 綁定刪除按鈕
        document.querySelectorAll('.cart-table .btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                cart.splice(idx, 1);
                refreshDisplay();
            });
        });

        totalPriceLabel.textContent = `$ ${total.toLocaleString()}`;
        updatePaymentLogic(total);
    }

    /**
     * 計算實收、找零並決定結帳按鈕狀態
     */
    function updatePaymentLogic(totalPrice = null) {
        if (totalPrice === null) {
            totalPrice = cart.reduce((sum, item) => sum + item.final_price, 0);
        }

        // 解析上方輸入框的數字 (如果是 "數量: 100"，要把文字濾掉)
        const inputStr = currentInput.replace("數量: ", "");
        receivedAmount = parseInt(inputStr);
        if (isNaN(receivedAmount)) {
            receivedAmount = 0;
        }

        lblReceived.textContent = `實收: $ ${receivedAmount.toLocaleString()}`;

        if (totalPrice > 0 && receivedAmount >= totalPrice) {
            const change = receivedAmount - totalPrice;
            lblChange.textContent = `找零: $ ${change.toLocaleString()}`;
            lblChange.style.color = "#00FF00";

            // 啟用結帳按鈕
            btnCheckout.disabled = false;
        } else {
            lblChange.textContent = `找零: $ 0`;
            lblChange.style.color = "#ffffff";

            // 停用結帳按鈕
            btnCheckout.disabled = true;
        }
    }

    /**
     * 處理數字鍵盤輸入
     */
    function appendInput(val) {
        if (currentInput === "張媽媽滷味") {
            currentInput = val;
        } else {
            // 如果原本有 "數量: "，要保留邏輯
            currentInput = currentInput.replace("數量: ", "") + val;
        }
        infoLabel.textContent = `數量: ${currentInput}`;
        updatePaymentLogic();
    }

    function clearInput() {
        currentInput = "張媽媽滷味";
        infoLabel.textContent = currentInput;
        updatePaymentLogic();
    }

    /**
     * 加入購物車 (讀取現在的輸入數量)
     */
    function addToCart(pid) {
        const inputStr = currentInput.replace("數量: ", "");
        let qty = parseInt(inputStr);
        if (isNaN(qty) || qty <= 0) {
            qty = 1;
        }

        const p = PosData.getProductById(pid);
        if (p) {
            if (p.stock >= qty) {
                cart.push({
                    id: pid,
                    name: p.name,
                    price: p.price,
                    qty: qty,
                    final_price: p.price * qty
                });
                clearInput();
                refreshDisplay();
            } else {
                alert(`「${p.name}」庫存不足，剩餘：${p.stock}`);
            }
        }
    }

    /**
     * 結帳作業
     */
    function checkout() {
        const total = cart.reduce((sum, item) => sum + item.final_price, 0);
        const change = receivedAmount - total;

        // 呼叫 PosData 處理扣庫存與交易紀錄
        PosData.processCheckout(cart, total);

        // 顯示結帳 Modal
        checkoutTotal.textContent = `應收： $ ${total.toLocaleString()}`;
        checkoutReceived.textContent = `實收： $ ${receivedAmount.toLocaleString()}`;
        checkoutChange.textContent = `$ ${change.toLocaleString()}`;
        modalCheckout.classList.add('active');

        // 清空購物車與輸入
        cart = [];
        clearInput();
        loadAndRenderProducts(); // 因為庫存扣了，重繪
        refreshDisplay();
    }


    // ==========================================
    // 品項管理 Modal 邏輯
    // ==========================================

    function loadManageTable() {
        manageTbody.innerHTML = '';
        selectedManageRowId = null;

        PosData.getProducts().forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>$${p.price}</td>
            `;
            // 選取列事件
            tr.addEventListener('click', () => {
                // 清除其他列的選取狀態
                manageTbody.querySelectorAll('tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
                selectedManageRowId = p.id;
            });
            manageTbody.appendChild(tr);
        });
    }

    function addProduct() {
        const name = inputNewName.value.trim();
        const price = inputNewPrice.value.trim();

        if (name && price && !isNaN(price)) {
            PosData.addProduct(name, price);
            alert(`商品「${name}」已新增`);

            inputNewName.value = '';
            inputNewPrice.value = '';

            loadManageTable();
            loadAndRenderProducts();
        } else {
            alert("請輸入有效的名稱與數字金額！");
        }
    }

    function deleteSelectedProduct() {
        if (!selectedManageRowId) {
            alert("請先從左側清單點選要刪除的商品");
            return;
        }

        const p = PosData.getProductById(selectedManageRowId);
        if (confirm(`確定要從資料庫永久刪除「${p.name}」嗎？`)) {
            PosData.deleteProduct(selectedManageRowId);
            alert(`商品「${p.name}」已移除`);
            loadManageTable();
            loadAndRenderProducts();
        }
    }

    // ==========================================
    // 事件綁定
    // ==========================================

    // 鍵盤輸入綁定
    numBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            appendInput(e.target.getAttribute('data-val'));
        });
    });

    btnClear.addEventListener('click', clearInput);

    // 結帳
    btnCheckout.addEventListener('click', checkout);

    // 結帳 Modal 確認按鈕
    btnCheckoutConfirm.addEventListener('click', () => {
        modalCheckout.classList.remove('active');
    });

    // 支援 Enter 鍵關閉 Modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && modalCheckout.classList.contains('active')) {
            modalCheckout.classList.remove('active');
        }
    });

    // 分頁
    btnPrev.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            loadAndRenderProducts();
        }
    });

    btnNext.addEventListener('click', () => {
        if ((currentPage + 1) * itemsPerPage < productList.length) {
            currentPage++;
            loadAndRenderProducts();
        }
    });

    // 品項管理 Modal 開關
    btnManageOpen.addEventListener('click', () => {
        loadManageTable();
        modalManage.classList.add('active');
    });

    btnManageClose.addEventListener('click', () => {
        modalManage.classList.remove('active');
    });

    // 品項管理 新增與刪除
    btnAddProduct.addEventListener('click', addProduct);
    btnDeleteProduct.addEventListener('click', deleteSelectedProduct);


    // --- 實作：初始載入 ---
    loadAndRenderProducts();
    refreshDisplay();
});
