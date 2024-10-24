document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch('/api/config');
    const config = await response.json();
    const socket = (window as any).io(config.PATH);
    const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
    const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
    const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
    let localStream: MediaStream;
    let peer: any;

    const getMedia = async () => {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
            socket.emit("join");
        } catch (error) {
            console.error("Error accessing media devices.", error);
        }
    }

    const createPeer = async (isInitiator: boolean, remoteSocketId: string) => {
        peer = new (window as any).SimplePeer({
            initiator: isInitiator,
            stream: localStream,
            trickle: false,
        });

        peer.on("signal", (signal: any) => {
            console.log("createPeer signal---", signal);
            socket.emit("signal", { to: remoteSocketId, signal });
        });

        peer.on("stream", (remoteStream: MediaStream) => {
            console.log("createPeer stream---", remoteStream);
            remoteVideo.srcObject = remoteStream;
        });

        peer.on("error", (err: Error) => console.error("Peer connection error:", err));
    }

    connectButton.addEventListener("click", () => {
        console.log("click button---")
        getMedia();
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

});