// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Adjust path if necessary

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    verificationCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    publicKey: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
});

module.exports = User;
