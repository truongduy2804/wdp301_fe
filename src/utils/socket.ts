import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (userId: number) => {
  if (socket?.connected) return socket;

  socket = io("http://localhost:8000", {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 50,
    reconnectionDelay: 500,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
    socket?.emit("join", { userId }); // backend join room theo userId
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};

export const subscribeNotification = (handler: (payload: any) => void) => {
  if (!socket) return () => {};
  const onNoti = (data: any) => handler(data);

  socket.on("notification", onNoti);

  return () => {
    socket?.off("notification", onNoti);
  };
};
