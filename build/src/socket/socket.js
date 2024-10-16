"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectSocket = void 0;
const socket_io_1 = require("socket.io");
const connectSocket = (server) => {
    try {
        const io = new socket_io_1.Server(server, {
            cors: { origin: "*" }
        });
        io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
            socket.setMaxListeners(0);
            socket.on('signal', (data) => {
                io.to(data.to).emit('signal', {
                    from: socket.id,
                    signal: data.signal,
                });
            });
            // Notify all users of the new connection
            socket.on('join', () => {
                socket.broadcast.emit('new-peer', socket.id);
            });
        }));
    }
    catch (err) {
        throw err;
    }
};
exports.connectSocket = connectSocket;
