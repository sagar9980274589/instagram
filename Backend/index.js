import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // Fix 'Credential' to 'credentials'
}));

// Routes
import userRoute from './route/user.route.js';


app.use('/user', userRoute);

// Root route for testing
app.get('/', (req, res) => {
  res.send("Hello, world!");
});

// Initialize Socket.IO with CORS configuration
 const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true, // Enable credentials
  }
});

const userSocketMap = {}; // Store userId to socketId mappings
export const getsocketid=(receiverId)=>{

  return userSocketMap[receiverId]

}
// Handle socket connections
io.on('connection', (socket) => {


  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;

    io.emit('getonlineusers', Object.keys(userSocketMap));

  } else {
    console.log('User connected without userId!');
  }

  // Handle disconnection
  socket.on('disconnect', () => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      delete userSocketMap[userId];  // Remove user from map

      io.emit('getonlineusers', Object.keys(userSocketMap));
    } else {
      console.log('Disconnected socket has no associated userId!');
    }
  });
  // Handle manual disconnect by socket ID
  socket.on('disconnectById', (targetSocketId) => {
    // Find the socket by ID in userSocketMap
    const targetUserId = Object.keys(userSocketMap).find(
      userId => userSocketMap[userId] === targetSocketId
    );

    if (targetUserId && userSocketMap[targetUserId]) {
      // Get the socket instance and disconnect it
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.disconnect();
        console.log(`Socket with ID ${targetSocketId} has been disconnected`);
      }
    } else {
      console.log(`No socket found with ID ${targetSocketId}`);
    }
  });
});

// Start server
const port = process.env.PORT || 3000;  // Fallback to port 3000 if not defined in .env
server.listen(port, () => {
  connectDB();  // Connect to DB
  console.log(`Server running on port ${port}`);
});

export {io}