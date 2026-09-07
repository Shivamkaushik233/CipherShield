const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");

let io = null;

function init(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No auth token"));
      const decoded = verifyToken(token);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { id, role } = socket.user;
    socket.join(`user:${id}`);
    if (["analyst", "admin", "auditor"].includes(role)) {
      socket.join("analysts");
    }
    console.log(`[socket] connected user=${id} role=${role}`);

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected user=${id}`);
    });
  });

  return io;
}

function emitToAnalysts(event, payload) {
  if (!io) return;
  io.to("analysts").emit(event, payload);
}

function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

function emitBroadcast(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

module.exports = { init, emitToAnalysts, emitToUser, emitBroadcast };
