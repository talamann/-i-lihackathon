// models/Conversation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Adjust path if necessary

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user1_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',  // Assumes your user table is named 'Users'
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    user2_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    encrypted_session_key_user1: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    encrypted_session_key_user2: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
});

module.exports = Conversation;
