require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// 允許直接作為靜態檔案伺服器 (供測試 pos-app.html 使用)
app.use(express.static(__dirname));

// LINE Pay API 設定
const LINE_PAY_CHANNEL_ID = process.env.LINE_PAY_CHANNEL_ID;
const LINE_PAY_CHANNEL_SECRET = process.env.LINE_PAY_CHANNEL_SECRET;
const LINE_PAY_VERSION = 'v3';
// 測試環境 URL (Sandbox)
const LINE_PAY_SITE = 'https://sandbox-api-pay.line.me';

// ==========================================
// 共用函式：產生 LINE Pay HMAC Signature
// ==========================================
function createSignature(uri, linePayBody, nonce) {
    const stringToSign = `${LINE_PAY_CHANNEL_SECRET}${uri}${JSON.stringify(linePayBody)}${nonce}`;
    return crypto
        .createHmac('sha256', LINE_PAY_CHANNEL_SECRET)
        .update(stringToSign)
        .digest('base64');
}

// ==========================================
// API 1: 請求付款 (Request API)
// 接收前端購物車資料 -> 向 LINE Pay 請求 Payment URL
// ==========================================
app.post('/api/linepay/request', async (req, res) => {
    try {
        const { amount, currency, orderId, packages } = req.body;

        const body = {
            amount: amount,
            currency: currency || 'TWD',
            orderId: orderId || `ORDER_${new Date().getTime()}`,
            packages: packages,
            redirectUrls: {
                // 付款確認成功後跳轉回來的網址 (需改成你的實際網域)
                confirmUrl: `http://localhost:3000/linepay-success.html`,
                // 取消付款跳轉回來的網址
                cancelUrl: `http://localhost:3000/pos-app.html`
            }
        };

        const uri = `/${LINE_PAY_VERSION}/payments/request`;
        const nonce = uuidv4();
        const signature = createSignature(uri, body, nonce);

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-LINE-ChannelId': LINE_PAY_CHANNEL_ID,
                'X-LINE-Authorization-Nonce': nonce,
                'X-LINE-Authorization': signature
            }
        };

        console.log("Sending Request to LINE Pay...");
        const response = await axios.post(`${LINE_PAY_SITE}${uri}`, body, config);

        console.log("LINE Pay Response:", response.data);

        // 將 LINE Pay 的回應 (包含 paymentUrl.web) 原封不動回傳給前端
        res.json(response.data);

    } catch (error) {
        console.error("LINE Pay Request Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to request LINE Pay" });
    }
});

// ==========================================
// API 2: 確認付款 (Confirm API)
// 當使用者在手機上授權完成，跳轉回 confirmUrl 後，前端會呼叫這支 API 進行最後扣款確認
// ==========================================
app.post('/api/linepay/confirm', async (req, res) => {
    try {
        const { transactionId, amount, currency } = req.body;

        const body = {
            amount: amount,
            currency: currency || 'TWD'
        };

        const uri = `/${LINE_PAY_VERSION}/payments/${transactionId}/confirm`;
        const nonce = uuidv4();
        const signature = createSignature(uri, body, nonce);

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-LINE-ChannelId': LINE_PAY_CHANNEL_ID,
                'X-LINE-Authorization-Nonce': nonce,
                'X-LINE-Authorization': signature
            }
        };

        console.log(`Confirming Transaction ID: ${transactionId}`);
        const response = await axios.post(`${LINE_PAY_SITE}${uri}`, body, config);

        console.log("LINE Pay Confirm Response:", response.data);
        res.json(response.data);

    } catch (error) {
        console.error("LINE Pay Confirm Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to confirm LINE Pay transaction" });
    }
});

// ==========================================
// 啟動伺服器
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`LINE Pay Backend Server running at http://localhost:${PORT}`);
});
