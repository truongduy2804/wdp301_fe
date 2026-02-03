import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUserId: number | null = null;

function getSocketUrl() {
  const explicit = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (explicit) return explicit;

  const apiBase = import.meta.env.VITE_API_BASE_URL as string;
  if (!apiBase) throw new Error("Missing VITE_API_BASE_URL");
  return new URL(apiBase).origin; // bỏ /api/v1 -> lấy origin
}

export const connectSocket = (userId: number) => {
  const SOCKET_URL = getSocketUrl();

  // nếu đổi userId thì disconnect socket cũ để tránh join sai room
  if (socket && currentUserId !== userId) {
    socket.disconnect();
    socket = null;
  }

  currentUserId = userId;

  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
    socket?.emit("join", { userId });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  socket.on("notification", (data) => {
    console.log("🔔 Notification:", data);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
  currentUserId = null;
};

export const subscribeNotification = (handler: (payload: any) => void) => {
  if (!socket) return () => {};

  const onNoti = (data: any) => {
    console.log("✅ RECEIVED notification:", data);
    handler(data);
  };

  socket.on("notification", onNoti);

  return () => {
    socket?.off("notification", onNoti);
  };
};
