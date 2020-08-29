// Import dependencies
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const index = require("./routes/index");
const socketsHandler = require("./routes/socket");
const bodyParser = require('body-parser');
const stoppable = require('stoppable');
const cors = require('cors');

// Initialize database models and connect.
const { connectDb } = require("./models");
connectDb()

// Define and setup server
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(cors())
app.use(index);
const server = stoppable(http.createServer(app));
const io = socketIo(server);

// Tell socket.io to use redis adapter if specified
if(process.env.Redis_Hostname){
  var redis = require('socket.io-redis');
  io.adapter(redis({ host: process.env.Redis_Hostname, port: 6379 }));
}

// Tell socket events to go to socket handler. Similar to how routes work
io.on("connection", socket => {
  socketsHandler(io, socket)
});

module.exports = server;