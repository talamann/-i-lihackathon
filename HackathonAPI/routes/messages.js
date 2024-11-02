const express = require('express');
const { Conversation} = require('../models/Conversation');
const { Message} = require('../models/Message');
const router = express.Router();
const crypto = require('crypto');

// Send a message
router.post('/:conversationId/messages', async (req, res) => {
    const { conversationId } = req.params;
    const { sender_id, encrypted_content } = req.body;

    try {
        // Verify conversation exists
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

        // Check if sender is part of the conversation
        if (sender_id !== conversation.user1_id && sender_id !== conversation.user2_id) {
            return res.status(403).json({ error: 'Sender is not part of this conversation' });
        }

        // Create the message
        const message = await Message.create({
            conversation_id: conversationId,
            sender_id,
            encrypted_content,
            timestamp: new Date()
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Error sending message" });
    }
});

// Get all messages in a conversation
router.get('/:conversationId/messages', async (req, res) => {
    const { conversationId } = req.params;

    try {
        const messages = await Message.findAll({
            where: { conversation_id: conversationId },
            order: [['timestamp', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Error fetching messages" });
    }
});

module.exports = router;
