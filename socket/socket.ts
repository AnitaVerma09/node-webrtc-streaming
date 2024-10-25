import { Server, Socket } from "socket.io";

interface Room {
    broadcaster: string;
    viewers: Set<string>;
}

const rooms = new Map<string, Room>();

const connectSocket = (server: any) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        socket.on('create-room', (roomId: string) => {
            console.log('Creating room: server', roomId);
            rooms.set(roomId, {
                broadcaster: socket.id,
                viewers: new Set()
            });
            socket.join(roomId);
        });

        socket.on('join-room', (roomId: string) => {
            console.log("join-room-- server--", roomId)
            const room = rooms.get(roomId);
            if (!room) {
                socket.emit('room-not-found');
                return;
            }

            socket.join(roomId);
            room.viewers.add(socket.id);
            socket.to(room.broadcaster).emit('viewer-joined', {
                socketId: socket.id,
                roomId: roomId
            });
        });

        socket.on('offer', (data: { to: string, offer: RTCSessionDescriptionInit, roomId: string }) => {
            console.log("offer--------- server", data.to, data.roomId);
            socket.to(data.to).emit('offer', {
                from: socket.id,
                offer: data.offer,
                roomId: data.roomId
            });
        });

        socket.on('answer', (data: { to: string, answer: RTCSessionDescriptionInit, roomId: string }) => {
            console.log("answer--------- server", data.to, data.roomId);

            socket.to(data.to).emit('answer', {
                from: socket.id,
                answer: data.answer
            });
        });

        socket.on('ice-candidate', (data: { to: string, candidate: RTCIceCandidateInit, roomId: string }) => {
            console.log("ice-candidate--------- server", data);

            socket.to(data.to).emit('ice-candidate', {
                from: socket.id,
                candidate: data.candidate
            });
        });

        socket.on('leave-room', (roomId: string) => {
            console.log("leave room------")
            const room = rooms.get(roomId);
            console.log("room----",room)
            if (room) {
                if (room.broadcaster === socket.id) {
                    socket.to(roomId).emit('broadcaster-left');
                    rooms.delete(roomId);
                } else {
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
                } else if (room.viewers.has(socket.id)) {
                    room.viewers.delete(socket.id);
                }
            }
        });
    });
};

export { connectSocket };


