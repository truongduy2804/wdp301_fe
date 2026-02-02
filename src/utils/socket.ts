// TODO: Install socket.io-client package: npm install socket.io-client
// import { io, Socket } from "socket.io-client";

// Stub implementations until socket.io-client is installed
type Socket = any;

let socket: Socket | null = null;
let currentUserId: number | null = null;

function getSocketUrl() {
  const explicit = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (explicit) return explicit;

  const apiBase = import.meta.env.VITE_API_BASE_URL as string;
  if (!apiBase) throw new Error("Missing VITE_API_BASE_URL");
  return new URL(apiBase).origin;
}

export const connectSocket = (userId: number) => {
  console.log("📡 [STUB] connectSocket called for userId:", userId);
  console.warn("⚠️ Socket.IO is not available. Install socket.io-client to enable real-time features.");
  currentUserId = userId;
  return null;

  // TODO: Uncomment when socket.io-client is installed
  // const SOCKET_URL = getSocketUrl();
  //
  // if (socket && currentUserId !== userId) {
  //   socket.disconnect();
  //   socket = null;
  // }
  //
  // currentUserId = userId;
  //
  // if (socket?.connected) return socket;
  //
  // socket = io(SOCKET_URL, {
  //   transports: ["websocket", "polling"],
  //   withCredentials: true,
  //   reconnection: true,
  //   reconnectionAttempts: 50,
  //   reconnectionDelay: 500,
  //   timeout: 10000,
  // });
  //
  // socket.onAny((event, ...args) => {
  //   console.log("📩 [socket.onAny]", event, args);
  // });
  //
  // socket.on("connect", () => {
  //   console.log("🟢 Socket connected:", socket?.id);
  //   socket?.emit("join", { userId: String(userId) }, (ack: any) => {
  //     console.log("✅ join ack:", ack);
  //   });
  // });
  //
  // socket.io.on("reconnect", () => {
  //   console.log("🔁 Socket reconnected");
  //   socket?.emit("join", { userId: String(userId) });
  // });
  //
  // socket.on("connect_error", (err) => {
  //   console.error("❌ connect_error:", err.message, err);
  // });
  //
  // socket.on("disconnect", (reason) => {
  //   console.log("🔴 Socket disconnected:", reason);
  // });
  //
  // socket.on("notification", (data) => {
  //   console.log("🔔 Notification:", data);
  // });
  //
  // return socket;
};

export const disconnectSocket = () => {
  console.log("📡 [STUB] disconnectSocket called");
  socket = null;
  currentUserId = null;

  // TODO: Uncomment when socket.io-client is installed
  // if (!socket) return;
  // socket.disconnect();
  // socket = null;
  // currentUserId = null;
};

export const subscribeNotification = (handler: (payload: any) => void) => {
  console.log("📡 [STUB] subscribeNotification called");
  return () => { };

  // TODO: Uncomment when socket.io-client is installed
  // if (!socket) return () => {};
  //
  // const onNoti = (data: any) => {
  //   console.log("✅ RECEIVED notification:", data);
  //   handler(data);
  // };
  //
  // socket.on("notification", onNoti);
  //
  // return () => {
  //   socket?.off("notification", onNoti);
  // };
};
