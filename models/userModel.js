const db = require('../config/db');

const findUserByEmail = async (email) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const createUser = async (firstName, lastName, email, hashedPassword) => {
    await db.execute('INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)', [firstName, lastName, email, hashedPassword]);
};

const updateUserPassword = async (email, hashedPassword) => {
    await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
};

const setResetToken = async (email, token, expiry) => {
    await db.execute('UPDATE users SET reset_token = ?, token_expiry = ? WHERE email = ?', [token, expiry, email]);
};

module.exports = { findUserByEmail, createUser, updateUserPassword, setResetToken };
