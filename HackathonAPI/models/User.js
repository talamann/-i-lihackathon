// models/User.js
module.exports = (sequelize, DataTypes) => {
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
        publicKey: {
            type: DataTypes.TEXT,  // Store the public key as text
            allowNull: false,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });

    return User;
};