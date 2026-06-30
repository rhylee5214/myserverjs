const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let uniqueIPs = new Set();

wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;

    if (!uniqueIPs.has(ip)) {
        uniqueIPs.add(ip);
    }

    broadcast(uniqueIPs.size);

    ws.on("close", () => {
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

// ⭐ IMPORTANT: Render requires this
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
