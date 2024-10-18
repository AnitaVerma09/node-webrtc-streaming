"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectSocket = void 0;
const socket_io_1 = require("socket.io");
const connectSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: { origin: "*" }
    });
    io.on("connection", (socket) => {
        console.log('New client connected:', socket.id);
        socket.on('join', () => {
            socket.broadcast.emit('new-peer', socket.id);
        });
        socket.on('signal', (data) => {
            io.to(data.to).emit('signal', {
                from: socket.id,
                signal: data.signal,
            });
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
exports.connectSocket = connectSocket;
// import { Server, Socket } from "socket.io";
// const connectSocket = (server: object) => {
//     try {
//         const io = new Server(server, {
//             cors: { origin: "*" }
//         });
//         io.on("connection", async (socket: Socket | any) => {
//             socket.setMaxListeners(0);
//             socket.on('signal', (data:any) => {
//                 io.to(data.to).emit('signal', {
//                     from: socket.id,
//                     signal: data.signal,
//                 });
//             });
//             // Notify all users of the new connection
//             socket.on('join', () => {
//                 socket.broadcast.emit('new-peer', socket.id);
//             });
//         })
//     }
//     catch (err) {
//         throw err;
//     }
// }
// export {
//     connectSocket
// }
