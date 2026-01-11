const mongoose = require('mongoose');

const connectionString = process.env.CONNECTION_STRING || 'mongodb://localhost:27017/auracare';

mongoose.connect(connectionString)
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });
