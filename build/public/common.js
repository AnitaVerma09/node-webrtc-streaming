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
// const roomIdDisplay = document.getElementById('roomIdDisplay') as HTMLElement;
const joinButton = document.getElementById('joinButton');
const leaveButton = document.getElementById('leaveButton');
const roomIdInput = document.getElementById('roomIdInput');
function initSocket() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("----initSocket");
            // const response = await fetch('/api/config');
            // const config = await response.json();
            socket = window.io();
            setupSocketListeners();
        }
        catch (error) {
            console.error('Socket initialization failed:', error);
            throw error;
        }
    });
}
function setupSocketListeners() {
    console.log("setupSocketListeners----");
    socket.on("offer", (data) => __awaiter(this, void 0, void 0, function* () {
        console.log(" setupSocketListeners ---  offer data----", data);
        console.log("currentRoomId---", currentRoomId);
        if (currentRoomId === data.roomId) {
            console.log("setupSocketListeners ---  offer iffff");
            yield handleOffer(data.from, data.offer);
        }
    }));
    socket.on("answer", (data) => __awaiter(this, void 0, void 0, function* () {
        console.log(" setupSocketListeners ---  answer data----", data);
        const pc = peerConnections.get(data.from);
        console.log("pc----", pc);
        if (pc)
            yield pc.setRemoteDescription(data.answer);
    }));
    socket.on("ice-candidate", (data) => __awaiter(this, void 0, void 0, function* () {
        console.log(" setupSocketListeners ---  ice-candidate data----", data);
        const pc = peerConnections.get(data.from);
        console.log("pc----", pc);
        if (pc)
            yield pc.addIceCandidate(data.candidate);
    }));
}
function getMedia() {
    return __awaiter(this, void 0, void 0, function* () {
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
}
function createPeerConnection(remoteSocketId, isInitiator) {
    return __awaiter(this, void 0, void 0, function* () {
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
}
function handleOffer(remoteSocketId, offer) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("handleOffer-----");
        const pc = yield createPeerConnection(remoteSocketId, false);
        yield pc.setRemoteDescription(offer);
        const answer = yield pc.createAnswer();
        yield pc.setLocalDescription(answer);
        socket.emit("answer", { to: remoteSocketId, answer, roomId: currentRoomId });
    });
}
function createRoom() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("----createRoom");
        currentRoomId = Math.random().toString(36).substring(2, 9);
        socket.emit("create-room", currentRoomId);
        return currentRoomId;
    });
}
function joinRoom(roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("joinRoom------");
        currentRoomId = roomId;
        socket.emit("join-room", roomId);
    });
}
function handleNewViewer(data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("handleNewViewer-----", data);
        console.log("currentRoomId---", currentRoomId);
        if (currentRoomId === data.roomId) {
            yield createPeerConnection(data.socketId, true);
        }
    });
}
function cleanup() {
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
}
function getCurrentRoomId() {
    console.log("getCurrentRoomId----");
    return currentRoomId;
}
const showError = (message) => {
    console.log("Show error message:", message);
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 3000);
};
