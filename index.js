require('dotenv').config();
// Server restart triggered by update
const express = require('express');
const cors = require('cors');
require('./dbConfig');

const router = require('./routes');

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('./uploads'));
app.use(router);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// port
const Port = process.env.PORT || 3000;

app.listen(Port, () => {
    console.log("AuraCare Server is running on", Port);
});
