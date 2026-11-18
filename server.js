const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const { requireLogin, requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// 連線到 MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/library_system')
  .then(() => console.log('MongoDB 連線成功'))
  .catch(err => console.error('MongoDB 連線失敗:', err));

// 設定 View Engine
app.set('view engine', 'ejs');

// Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session 設定
app.use(session({
  secret: 'mySuperSecretKey123',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 // 1 天
  }
}));

// 使用 Auth 路由
app.use(authRoutes);

// 首頁 / 根目錄導向
app.get('/', (req, res) => {
  res.redirect('/books');
});

// 圖書館主頁面 (需要登入才能看)
app.get('/books', requireLogin, (req, res) => {
  res.send(`
    <h1>歡迎來到圖書館首頁，${req.session.username}！</h1>
    <p>你的身分：${req.session.role}</p>
    <a href="/logout">登出系統</a>
    ${req.session.role === 'admin' ? '<br><br><a href="/admin">前往管理員專區</a>' : ''}
  `);
});

// 管理員專區 (需要 admin 權限)
app.get('/admin', requireLogin, requireAdmin, (req, res) => {
  res.send('<h1>管理員專區</h1><p>這裡只有管理員看得見！</p><a href="/books">回首頁</a>');
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器運行中：http://localhost:${PORT}`);
});
