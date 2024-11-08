require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Serve static files from the public directory
app.use(express.static("public"));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle joining a room
    socket.on('join', (room) => {
        socket.join(room);
        const roomClients = io.sockets.adapter.rooms.get(room);

        // Notify the user to create an offer if there's already another participant
        if (roomClients.size > 1) {
            socket.emit('ready');
        }

        console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Handle receiving an offer from a peer
    socket.on('offer', (data) => {
        console.log(`Offer received from ${socket.id} for room ${data.room}`);
        socket.to(data.room).emit('offer', data.offer);
    });

    // Handle receiving an answer from a peer
    socket.on('answer', (data) => {
        console.log(`Answer received from ${socket.id} for room ${data.room}`);
        socket.to(data.room).emit('answer', data.answer);
    });

    // Handle receiving an ICE candidate from a peer
    socket.on('candidate', (data) => {
        console.log(`ICE candidate received from ${socket.id} for room ${data.room}`);
        socket.to(data.room).emit('candidate', data.candidate);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
