import { Server, Socket } from "socket.io";

const connectSocket = (server: object) => {
    try {
        const io = new Server(server, {
            cors: { origin: "*" }
        });

        io.on("connection", async (socket: Socket | any) => {
            socket.setMaxListeners(0);
            
            socket.on('signal', (data:any) => {
                io.to(data.to).emit('signal', {
                    from: socket.id,
                    signal: data.signal,
                });
            });

            // Notify all users of the new connection
            socket.on('join', () => {
                socket.broadcast.emit('new-peer', socket.id);
            });



        })

        
    }
    catch (err) {
        throw err;
    }
}

export {
    connectSocket
}

