// routes/users.js
const express = require('express');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/email');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
console.log("User model:", User); 
const router = express.Router();

const SALT_ROUNDS = 10;

// routes/users.js
// User Registration with frontend-generated public key
// Register route without public key
router.post('/', async (req, res) => {
    const { username, email, password, publicKey } = req.body;

    try {
        // Ensure the publicKey is provided by the client
        if (!publicKey) {
            return res.status(400).json({ error: 'Public key is required' });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create the user with the provided public key and hashed password
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            publicKey,
            isVerified: true,  // Directly mark as verified since we're skipping email verification
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});
// Upload public key after registration
router.post('/upload-public-key', async (req, res) => {
    const { userId, publicKey } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update the user's public key
        user.publicKey = publicKey;
        await user.save();

        res.status(200).json({ message: 'Public key uploaded successfully' });
    } catch (error) {
        console.error('Error uploading public key:', error);
        res.status(500).json({ error: 'Error uploading public key' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Searching for user with email:', email);  // Log email

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User found:', user);

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            console.log('Incorrect password');
            return res.status(401).json({ error: 'Incorrect password' });
        }

        console.log('Password verified');

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback_jwt_secret',
            { expiresIn: '1h' }
        );

        console.log('JWT token generated:', token);

        // Return the token and user details
        res.status(200).json({
            message: 'Login successful',
            token,  // JWT token
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Error logging in user:', error);  // Log the error
        res.status(500).json({ error: 'Error logging in' });
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
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Get public key for a specific user
router.get('/:id/public-key', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            res.json({ publicKey: user.publicKey });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user public key' });
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
