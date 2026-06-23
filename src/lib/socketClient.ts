import { io } from "socket.io-client";

const LAPTOP_WIFI_IP = "10.151.82.189"; 

// Create a single, isolated socket manager file
export const socket = io(`http://${LAPTOP_WIFI_IP}:3000`, {
  autoConnect: false,
});