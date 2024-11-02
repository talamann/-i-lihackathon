// index.js
const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/db');  // Your database config
const userRoutes = require('./routes/users');  // Import the routes
const conversationsRouter = require('./routes/conversations');
const messagesRouter = require('./routes/messages');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Ensure JSON parsing middleware is enabled

// Mount the routes
app.use('/users', userRoutes);
app.use('/conversations', conversationsRouter);
app.use('/conversations', messagesRouter);

sequelize.sync()
    .then(() => {
        console.log('Database connected and synchronized');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(error => console.error('Error connecting to the database:', error));
