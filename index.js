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

// port
const Port = process.env.PORT || 3000;

server.listen(Port, () => {
    console.log("AuraCare Server is running on", Port);
});
