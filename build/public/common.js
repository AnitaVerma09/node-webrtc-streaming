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
let socket;
const peerConnections = new Map();
let localStream;
let currentRoomId = null;
const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};
const errorMessage = document.getElementById('errorMessage');
const remoteVideo = document.getElementById('remoteVideo');
const localVideo = document.getElementById('localVideo');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const joinButton = document.getElementById('joinButton');
const leaveButton = document.getElementById('leaveButton');
const roomIdInput = document.getElementById('roomIdInput');
const initSocket = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("----initSocket");
        socket = window.io();
        setupSocketListeners();
    }
    catch (error) {
        console.error('Socket initialization failed:', error);
        throw error;
    }
});
const setupSocketListeners = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("setupSocketListeners----");
    socket.on("offer", (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(" setupSocketListeners ---  offer data----", data);
        console.log("currentRoomId---", currentRoomId);
        if (currentRoomId === data.roomId) {
            console.log("setupSocketListeners ---  offer iffff");
            yield handleOffer(data.from, data.offer);
        }
    }));
    socket.on("answer", (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(" setupSocketListeners ---  answer data----", data);
        const pc = peerConnections.get(data.from);
        console.log("pc----", pc);
        if (pc)
            yield pc.setRemoteDescription(data.answer);
    }));
    socket.on("ice-candidate", (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(" setupSocketListeners ---  ice-candidate data----", data);
        const pc = peerConnections.get(data.from);
        console.log("pc----", pc);
        if (pc)
            yield pc.addIceCandidate(data.candidate);
    }));
});
const getMedia = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("---getMedia");
        localStream = yield navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideo)
            localVideo.srcObject = localStream;
        return localStream;
    }
    catch (error) {
        console.error("Error accessing media devices:", error);
        throw error;
    }
});
const toggleVideo = () => {
    try {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            return videoTrack;
        }
    }
    catch (error) {
        console.error("Error on toggle video:", error);
        throw error;
    }
    // if (localStream) {
    //     const videoTrack = localStream.getVideoTracks()[0];
    //     if (videoTrack) {
    //         videoTrack.enabled = enabled;
    //         console.log(`Video ${enabled ? "enabled" : "disabled"}`);
    //     }
    // }
};
const toggleAudio = () => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        return audioTrack;
        // if (audioTrack) {
        //     audioTrack.enabled = enabled;
        //     console.log(`Audio ${enabled ? "enabled" : "disabled"}`);
        // }
    }
};
const createPeerConnection = (remoteSocketId, isInitiator) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("createPeerConnection-----");
    const pc = new RTCPeerConnection(config);
    if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }
    pc.onicecandidate = (event) => {
        console.log("pc.onicecandidate----", event.candidate);
        if (event.candidate) {
            console.log("pc.onicecandidate----event.candidate");
            socket.emit("ice-candidate", { to: remoteSocketId, candidate: event.candidate, roomId: currentRoomId });
        }
    };
    pc.ontrack = (event) => {
        console.log("pc.ontrack----", remoteVideo);
        if (remoteVideo)
            remoteVideo.srcObject = event.streams[0];
    };
    peerConnections.set(remoteSocketId, pc);
    if (isInitiator) {
        console.log("if.isInitiator----", isInitiator);
        const offer = yield pc.createOffer();
        yield pc.setLocalDescription(offer);
        socket.emit("offer", { to: remoteSocketId, offer, roomId: currentRoomId });
    }
    return pc;
});
const handleOffer = (remoteSocketId, offer) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("handleOffer-----");
    const pc = yield createPeerConnection(remoteSocketId, false);
    yield pc.setRemoteDescription(offer);
    const answer = yield pc.createAnswer();
    yield pc.setLocalDescription(answer);
    socket.emit("answer", { to: remoteSocketId, answer, roomId: currentRoomId });
});
const createRoom = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("----createRoom");
    currentRoomId = Math.random().toString(36).substring(2, 9);
    socket.emit("create-room", currentRoomId);
    return currentRoomId;
});
const joinRoom = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("joinRoom------");
    currentRoomId = roomId;
    socket.emit("join-room", roomId);
});
const handleNewViewer = (data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("handleNewViewer-----", data);
    console.log("currentRoomId---", currentRoomId);
    if (currentRoomId === data.roomId) {
        yield createPeerConnection(data.socketId, true);
    }
});
const cleanup = () => {
    console.log("cleanup------");
    if (localStream)
        localStream.getTracks().forEach(track => track.stop());
    if (localVideo)
        localVideo.srcObject = null;
    if (remoteVideo)
        remoteVideo.srcObject = null;
    peerConnections.forEach(pc => pc.close());
    peerConnections.clear();
    if (currentRoomId) {
        console.log("currentRoomId----");
        socket.emit("leave-room", currentRoomId);
        currentRoomId = null;
    }
};
const getCurrentRoomId = () => {
    console.log("getCurrentRoomId----");
    return currentRoomId;
};
const showError = (message) => {
    console.log("Show error message:", message);
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 3000);
};
