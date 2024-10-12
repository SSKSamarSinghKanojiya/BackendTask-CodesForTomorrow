const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require("../config/db")
const { findUserByEmail, createUser, updateUserPassword, setResetToken } = require('../models/userModel');
const crypto = require('crypto');

// const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//     }
// });
const transporter = nodemailer.createTransport({
    service: "gmail",
    secure:true,
    port :465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
const signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(firstName, lastName, email, hashedPassword);
    res.status(201).json({ message: 'User created successfully' });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
};


// const forgotPassword = async (req, res) => {
//     const { email } = req.body;
//     const user = await findUserByEmail(email);
//     if (!user) {
//         return res.status(400).json({ message: 'User not found' });
//     }

//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000);  // 5 minutes
//     await setResetToken(email, resetToken, tokenExpiry);

//     const resetLink = `${process.env.FRONTEND_URL}?token=${resetToken}&email=${email}`;
//     await transporter.sendMail({
//         // from: process.env.SMTP_USER,
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'Password Reset Request',
//         html: `<a href="${resetLink}">Reset your password</a>`
//     });

//     res.status(200).json({ message: 'Password reset email sent' });
// };

// Forgot password handler
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Generate reset token and expiry (5 minutes)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000);  // 5 minutes
        await setResetToken(email, resetToken, tokenExpiry);

    console.log('Reset token generated:', resetToken);
    console.log('Sending email to:', email);

        // Generate reset link
        const resetLink = `${process.env.FRONTEND_URL}?token=${resetToken}&email=${email}`;

        // Setup Nodemailer transport
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Or your preferred email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Send reset email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetLink}">Reset your password</a>`
        });

        // Return success response
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    const user = await findUserByEmail(email);
    if (!user || user.reset_token !== token || new Date() > user.token_expiry) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(email, hashedPassword);
    res.status(200).json({ message: 'Password updated successfully' });
};


const getUserDetails = async (req, res) => {
    try {
        const userId = req.userId; // Assuming userId is set via JWT middleware
        const [rows] = await db.execute('SELECT first_name, last_name, email FROM users WHERE id = ?', [userId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { signup, login, forgotPassword, resetPassword ,getUserDetails};
