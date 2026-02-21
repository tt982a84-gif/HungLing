const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 初始化資料庫連線 (會自動在同目錄下建立 costdata.db)
const dbPath = path.resolve(__dirname, 'costdata.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('連線 SQLite 失敗:', err.message);
    } else {
        console.log('成功連線至 SQLite 資料庫 (costdata.db)');
        // 建立資料表
        db.run(`
            CREATE TABLE IF NOT EXISTS expenses (
                id TEXT PRIMARY KEY,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                note TEXT,
                date TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('建立資料表失敗:', err.message);
            } else {
                console.log('資料表 expenses 就緒');
            }
        });
    }
});

// 測試用 API：取得所有記帳紀錄
app.get('/api/expenses', (req, res) => {
    db.all('SELECT * FROM expenses ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

// 同步 API：接收手機端尚未同步的資料陣列
app.post('/api/sync', (req, res) => {
    const expenses = req.body;

    if (!Array.isArray(expenses) || expenses.length === 0) {
        return res.status(400).json({ message: "No data provided for sync" });
    }

    // 使用 Transaction 確保整批寫入成功
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare("INSERT OR REPLACE INTO expenses (id, amount, category, note, date) VALUES (?, ?, ?, ?, ?)");

        let hasError = false;
        expenses.forEach(exp => {
            stmt.run([exp.id, exp.amount, exp.category, exp.note, exp.date], function (err) {
                if (err) {
                    console.error("寫入錯誤", err);
                    hasError = true;
                }
            });
        });

        stmt.finalize();

        if (hasError) {
            db.run("ROLLBACK");
            res.status(500).json({ message: "Failed to sync data" });
        } else {
            db.run("COMMIT");
            console.log(`成功同步 ${expenses.length} 筆資料`);
            res.json({ message: "Sync successful", count: expenses.length });
        }
    });
});

app.listen(PORT, () => {
    console.log(`同步伺服器運行中: http://localhost:${PORT}`);
    console.log(`請確保手機與這台筆電連線至相同的 Wi-Fi`);
});
