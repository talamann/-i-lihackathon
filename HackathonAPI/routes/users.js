// routes/users.js
const express = require('express');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/email');
const User = require('../models/User');
const router = express.Router();

// routes/users.js
router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = await User.create({ username, email, password });
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
});

// Read all users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Read a single user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
});

// Update a user by ID
router.put('/:id', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.findByPk(req.params.id);
        if (user) {
            user.username = username;
            user.email = email;
            user.password = password;
            await user.save();
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            await user.destroy();
            res.json({ message: 'User deleted' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error("Error deleting user:", error); // Log the error details
        return res.status(500).json({ error: error.message });
    }
});


router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Generate a unique verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        // Create user with verification code and isVerified set to false
        const newUser = await User.create({
            username,
            email,
            password,
            isVerified: false,
            verificationCode,  // Store the code directly in the user record
        });

        // Send verification email
        await sendVerificationEmail(email, verificationCode);

        res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Error registering user:', error); // Log the full error for debugging
        if (error.name === 'SequelizeValidationError') {
            // Send specific validation messages if available
            return res.status(400).json({ error: error.errors.map(e => e.message) });
        }
        res.status(400).json({ error: error.errors.map(e => e.message) });
    }
});


// Email verification endpoint
router.post('/verify-email', async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

        // Check if the code matches
        if (user.verificationCode === verificationCode) {
            user.isVerified = true;
            user.verificationCode = null; // Clear the code after verification
            await user.save();

            res.status(201).json({ message: 'User verified successfully', user });
        } else {
            res.status(400).json({ error: 'Invalid verification code' });
        }
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'Error verifying email' });
    }
});

module.exports = router;
