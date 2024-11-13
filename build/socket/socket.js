"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectSocket = void 0;
const socket_io_1 = require("socket.io");
const rooms = new Map();
const connectSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: { origin: "*" }
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.on('create-room', (roomId) => {
            console.log('Creating room: server', roomId);
            rooms.set(roomId, {
                broadcaster: socket.id,
                viewers: new Set()
            });
            socket.join(roomId);
        });
        socket.on('join-room', (roomId) => {
            console.log("join-room-- server--", roomId);
            const room = rooms.get(roomId);
            console.log("room-----", room);
            if (!room) {
                socket.emit('room-not-found');
                return;
            }
            socket.join(roomId);
            socket.emit('room-found');
            room.viewers.add(socket.id);
            socket.to(room.broadcaster).emit('viewer-joined', {
                socketId: socket.id,
                roomId: roomId
            });
        });
        socket.on('offer', (data) => {
            console.log("offer--------- server", data.to, data.roomId);
            socket.to(data.to).emit('offer', {
                from: socket.id,
                offer: data.offer,
                roomId: data.roomId
            });
        });
        socket.on('answer', (data) => {
            console.log("answer--------- server", data.to, data.roomId);
            socket.to(data.to).emit('answer', {
                from: socket.id,
                answer: data.answer
            });
        });
        socket.on('ice-candidate', (data) => {
            console.log("ice-candidate--------- server", data);
            socket.to(data.to).emit('ice-candidate', {
                from: socket.id,
                candidate: data.candidate
            });
        });
        socket.on('leave-room', (roomId) => {
            console.log("leave room------");
            const room = rooms.get(roomId);
            console.log("room----", room);
            if (room) {
                if (room.broadcaster === socket.id) {
                    socket.to(roomId).emit('broadcaster-left');
                    rooms.delete(roomId);
                }
                else {
                    room.viewers.delete(socket.id);
                }
                socket.leave(roomId);
            }
        });
        socket.on('disconnect', () => {
            for (const [roomId, room] of rooms.entries()) {
                if (room.broadcaster === socket.id) {
                    socket.to(roomId).emit('broadcaster-left');
                    rooms.delete(roomId);
                }
                else if (room.viewers.has(socket.id)) {
                    room.viewers.delete(socket.id);
                }
            }
        });
    });
};
exports.connectSocket = connectSocket;
