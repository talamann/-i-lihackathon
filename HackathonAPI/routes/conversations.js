const express = require('express');
const { Conversation} = require('../models/Conversation');
const { User} = require('../models/User');
  // Ensure models are imported
const router = express.Router();
const crypto = require('crypto');

// Create a new conversation
// Create a new conversation
router.post('/', async (req, res) => {
    const { user1_id, user2_id, encrypted_session_key_user1, encrypted_session_key_user2 } = req.body;

    try {
        // Check if both users exist
        const user1 = await User.findByPk(user1_id);
        const user2 = await User.findByPk(user2_id);
        if (!user1 || !user2) return res.status(404).json({ error: 'One or both users not found' });

        // Check if a conversation already exists between these users
        const existingConversation = await Conversation.findOne({
            where: {
                [Op.or]: [
                    { user1_id, user2_id },
                    { user1_id: user2_id, user2_id: user1_id }
                ]
            }
        });

        if (existingConversation) {
            // If a conversation already exists, return it instead of creating a new one
            return res.status(200).json(existingConversation);
        }

        // Create the new conversation with the encrypted session keys
        const conversation = await Conversation.create({
            user1_id,
            user2_id,
            encrypted_session_key_user1,
            encrypted_session_key_user2,
        });

        res.status(201).json(conversation);
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ error: "Error creating conversation" });
    }
});


// Get all conversations for a user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [{ user1_id: userId }, { user2_id: userId }]
            }
        });
        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Error fetching conversations" });
    }
});

// Get conversation by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const conversation = await Conversation.findByPk(id);
        if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

        res.json(conversation);
    } catch (error) {
        console.error("Error fetching conversation:", error);
        res.status(500).json({ error: "Error fetching conversation" });
    }
});

// Retrieve encrypted session keys for a conversation
router.get('/:conversationId/session-keys', async (req, res) => {
    const { conversationId } = req.params;

    try {
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

        res.json({
            encrypted_session_key_user1: conversation.encrypted_session_key_user1,
            encrypted_session_key_user2: conversation.encrypted_session_key_user2
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching session keys' });
    }
});


module.exports = router;
