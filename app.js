require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Serve index.html from the root directory
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Rest of your WebRTC and Socket.io code
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (room) => {
        socket.join(room);
        const roomClients = io.sockets.adapter.rooms.get(room);
        if (roomClients.size > 1) {
            socket.emit('ready');
        }
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('offer', (data) => {
        socket.to(data.room).emit('offer', data.offer);
    });

    socket.on('answer', (data) => {
        socket.to(data.room).emit('answer', data.answer);
    });

    socket.on('candidate', (data) => {
        socket.to(data.room).emit('candidate', data.candidate);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
