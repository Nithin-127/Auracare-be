require('dotenv').config();
// Server restart triggered by update
const express = require('express');
const cors = require('cors');
require('./dbConfig');

const router = require('./routes');

const server = new express();

// middlewares
server.use(cors());
server.use(express.json());
server.use('/uploads', express.static('./uploads'));
server.use(router);

// Error handling middleware
server.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// port
const Port = process.env.PORT || 3000;

server.listen(Port, () => {
    console.log("AuraCare Server is running on", Port);
});
