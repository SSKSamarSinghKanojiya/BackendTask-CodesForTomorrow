const express = require('express');
const { signup, login, forgotPassword, resetPassword, getUserDetails } = require('../controllers/authcontroller');
const authenticateJWT = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/user', authenticateJWT, getUserDetails);  // Protected Route

module.exports = router;
