import { io } from "socket.io-client";

// Same rationale as services/api.js: relative "/" works with the Vite dev
// proxy locally; production needs the backend's absolute URL.
const socketURL = import.meta.env.VITE_SOCKET_URL || "/";

let socket = null;

export function connectSocket(token) {
  if (socket) socket.disconnect();
  socket = io(socketURL, {
    path: "/socket.io",
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
