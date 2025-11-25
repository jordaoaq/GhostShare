import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import path from "path";

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io with CORS enabled
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://ghostshare-p2p.vercel.app", // Your Vercel App
      "http://localhost:3000", // Local Development
      "http://localhost:5173", // Vite Dev Server
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["content-type"],
  },
  transports: ["websocket", "polling"], // Explicitly allow both transport methods
  allowEIO3: true, // Compatibility with older clients
});

const PORT = process.env.PORT || 3000;

// Store users in rooms: { roomId: [socketId1, socketId2] }
interface RoomUsers {
  [roomId: string]: string[];
}

const users: RoomUsers = {};

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining a room
  socket.on("join-room", (roomId: string) => {
    // Check if room exists
    if (users[roomId]) {
      const length = users[roomId].length;
      // Limit to 2 peers per room for this MVP
      if (length === 2) {
        socket.emit("room-full");
        return;
      }
      users[roomId].push(socket.id);
    } else {
      users[roomId] = [socket.id];
    }

    socket.join(roomId);

    // Notify existing user (if any) that a new peer has joined
    const peersInRoom = users[roomId].filter((id) => id !== socket.id);
    socket.emit("all-users", peersInRoom);
  });

  // Relay signaling data (SDP/Ice Candidates) to specific peer
  socket.on(
    "sending-signal",
    (payload: { userToSignal: string; signal: any; callerID: string }) => {
      io.to(payload.userToSignal).emit("user-joined", {
        signal: payload.signal,
        callerID: payload.callerID,
      });
    }
  );

  // Relay return signal to the caller
  socket.on(
    "returning-signal",
    (payload: { callerID: string; signal: any }) => {
      io.to(payload.callerID).emit("receiving-returned-signal", {
        signal: payload.signal,
        id: socket.id,
      });
    }
  );

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove user from all rooms
    for (const roomId in users) {
      users[roomId] = users[roomId].filter((id) => id !== socket.id);
      // Clean up empty rooms
      if (users[roomId].length === 0) {
        delete users[roomId];
      }
    }
  });
});

// Serve static files from the React client build directory
// We use path.resolve to ensure correct path resolution from server/dist/index.js
// Serve static files from the React client build directory
// We use path.resolve to ensure correct path resolution from server/dist/index.js
const clientBuildPath = path.resolve(__dirname, "../../client/dist");
console.log("Client Build Path:", clientBuildPath);

// DEBUG: Check if directory exists and list files
import fs from "fs";
try {
  if (fs.existsSync(clientBuildPath)) {
    console.log("Client build directory exists.");
    const files = fs.readdirSync(clientBuildPath);
    console.log("Files in client build:", files);
  } else {
    console.error("Client build directory DOES NOT EXIST at:", clientBuildPath);
    // Check parent directory
    const parent = path.resolve(__dirname, "../../client");
    if (fs.existsSync(parent)) {
      console.log("Client directory exists. Contents:", fs.readdirSync(parent));
    } else {
      console.log("Client directory DOES NOT EXIST at:", parent);
    }
  }
} catch (err) {
  console.error("Error checking directories:", err);
}

app.use(express.static(clientBuildPath));

// Handle SPA routing: serve index.html for any unknown route
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
