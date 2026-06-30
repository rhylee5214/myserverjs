const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let uniqueIPs = new Set();

wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;

    // If this IP is new, add it and broadcast
    if (!uniqueIPs.has(ip)) {
        uniqueIPs.add(ip);
    }

    broadcast(uniqueIPs.size);

    ws.on("close", () => {
        // Remove IP when they disconnect
        uniqueIPs.delete(ip);
        broadcast(uniqueIPs.size);
    });
});

function broadcast(count) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(count.toString());
        }
    });
}

app.use(express.static("public"));

server.listen(3001, () => {
    console.log("WebSocket server running on ws://localhost:3001");
});