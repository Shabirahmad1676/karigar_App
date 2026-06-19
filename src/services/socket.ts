import { io } from "socket.io-client";

export const socket = io("http://10.151.82.189:3000", {
  transports: ["websocket"],
  autoConnect: false,
});

export const connectSocket = (userId: number, role?: string) => {
  socket.connect();

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);

    socket.emit("join", { userId, role });
  });
};

export const disconnectSocket = () => {
  socket.disconnect();
};