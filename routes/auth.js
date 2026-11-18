const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 顯示登入頁
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/books');
  }
  res.render('login', { error: null });
});

// 處理登入
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { error: '帳號或密碼錯誤' });
    }

    // 登入成功，寫入 session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.redirect('/books');
  } catch (err) {
    console.error(err);
    res.render('login', { error: '登入時發生錯誤' });
  }
});

// 登出
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// 註冊（方便測試用）
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role: role || 'member' });
    await user.save();
    res.status(201).json({ message: '註冊成功', username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
