document.addEventListener("DOMContentLoaded", () => {
    const socket = (window as any).io("http://localhost:3000");
    const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
    const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
    const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
    let localStream: MediaStream;
    let peer: any;

    async function getMedia() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
            socket.emit("join");
        } catch (error) {
            console.error("Error accessing media devices.", error);
        }
    }

    function createPeer(isInitiator: boolean, remoteSocketId: any) {
        peer = new (window as any).SimplePeer({
            initiator: isInitiator,
            stream: localStream,
            trickle: false,
        });

        peer.on("signal", (signal: any) => {
            socket.emit("signal", { to: remoteSocketId, signal });
        });

        peer.on("stream", (remoteStream: MediaStream) => {
            remoteVideo.srcObject = remoteStream;
        });

        peer.on("error", (err: Error) => console.error("Peer connection error:", err));
    }

    connectButton.addEventListener("click", () => {
        socket.emit("join");
    });

    socket.on("new-peer", (remoteSocketId: string) => {
        console.log("New peer connected:", remoteSocketId);
        createPeer(true, remoteSocketId);
    });

    socket.on("signal", (data: { from: string, signal: any }) => {
        console.log("Signal received from:", data.from);
        if (!peer) {
            createPeer(false, data.from);
        }
        peer.signal(data.signal);
    });

    getMedia();
});