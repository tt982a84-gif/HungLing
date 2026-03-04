/**
 * pos-data.js 
 * 負責處理 LocalStorage 資料，模擬原本 Python 的 SQLite 資料庫行為
 */

const DB_KEY_PRODUCTS = 'pos_products';
const DB_KEY_TRANSACTIONS = 'pos_transactions';

// 預設示範商品 (如果 localStorage 沒資料時會載入)
const DEFAULT_PRODUCTS = [
    { id: 'M001', name: '招牌豆干', price: 30, stock: 100, category: '滷味' },
    { id: 'M002', name: '海帶', price: 20, stock: 100, category: '滷味' },
    { id: 'M003', name: '滷蛋', price: 15, stock: 100, category: '滷味' },
    { id: 'M004', name: '甜不辣', price: 25, stock: 100, category: '滷味' },
    { id: 'M005', name: '米血糕', price: 25, stock: 100, category: '滷味' },
    { id: 'M006', name: '百頁豆腐', price: 30, stock: 100, category: '滷味' },
    { id: 'M007', name: '高麗菜', price: 40, stock: 100, category: '蔬菜' },
    { id: 'M008', name: '金針菇', price: 35, stock: 100, category: '蔬菜' },
    { id: 'M009', name: '王子麵', price: 20, stock: 100, category: '主食' },
    { id: 'M010', name: '豬肉片', price: 50, stock: 100, category: '肉類' },
    { id: 'M011', name: '牛肉片', price: 60, stock: 100, category: '肉類' }
];

const PosData = {
    /**
     * 初始化資料庫 (載入預設資料)
     */
    init: function () {
        if (!localStorage.getItem(DB_KEY_PRODUCTS)) {
            localStorage.setItem(DB_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
        }
        if (!localStorage.getItem(DB_KEY_TRANSACTIONS)) {
            localStorage.setItem(DB_KEY_TRANSACTIONS, JSON.stringify([]));
        }
    },

    /**
     * 取得所有商品列表 (模擬 SELECT * FROM products ORDER BY id DESC)
     */
    getProducts: function () {
        try {
            const data = JSON.parse(localStorage.getItem(DB_KEY_PRODUCTS)) || [];
            // 由於原本 Python 是 ORDER BY id DESC，這裡也做排序
            return data.sort((a, b) => b.id.localeCompare(a.id));
        } catch (e) {
            console.error("Failed to parse products", e);
            return [];
        }
    },

    /**
     * 取得單一商品
     */
    getProductById: function (id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    },

    /**
     * 新增商品
     */
    addProduct: function (name, price) {
        const products = this.getProducts();

        // 產生類似 M0221175620 的 ID (月日時分秒)
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const newId = `M${mm}${dd}${hh}${min}${ss}`;

        const newProduct = {
            id: newId,
            name: name,
            price: parseInt(price),
            stock: 100, // 預設庫存 100
            category: '自訂'
        };

        products.push(newProduct);
        localStorage.setItem(DB_KEY_PRODUCTS, JSON.stringify(products));
        return newProduct;
    },

    /**
     * 刪除商品
     */
    deleteProduct: function (id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem(DB_KEY_PRODUCTS, JSON.stringify(products));
    },

    /**
     * 結帳作業 (扣除庫存、新增交易紀錄)
     */
    processCheckout: function (cart, total) {
        // 1. 扣庫存
        let products = this.getProducts();
        cart.forEach(item => {
            const index = products.findIndex(p => p.id === item.id);
            if (index !== -1) {
                products[index].stock -= item.qty;
                if (products[index].stock < 0) products[index].stock = 0;
            }
        });
        localStorage.setItem(DB_KEY_PRODUCTS, JSON.stringify(products));

        // 2. 記錄結帳
        try {
            const txs = JSON.parse(localStorage.getItem(DB_KEY_TRANSACTIONS)) || [];
            txs.push({
                id: Date.now(),
                total: total,
                created_at: new Date().toISOString()
            });
            localStorage.setItem(DB_KEY_TRANSACTIONS, JSON.stringify(txs));
        } catch (e) {
            console.error(e);
        }
    }
};

// 執行初始化
PosData.init();
