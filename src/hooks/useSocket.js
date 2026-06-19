import { useEffect } from "react";
import { socket, connectSocket } from "../services/socket";
import { useAuthStore } from "../store/auth.store";
import Toast from "react-native-toast-message";

export const useSocket = () => {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    connectSocket(user.id, user.role);

    socket.on("new_job_available", (job) => {
      console.log("NEW JOB:", job);
      Toast.show({ type: "info", text1: "New job posted", text2: job.title || 'A new job is available' });
    });

    socket.on("new_bid", (data) => {
      console.log("NEW BID:", data);
      Toast.show({ type: "info", text1: "New bid received", text2: `Job ID: ${data.jobId}` });
    });

    socket.on("bid_accepted", (data) => {
      console.log("BID ACCEPTED:", data);
      Toast.show({ type: "success", text1: "Your bid was accepted", text2: `Job ID: ${data.jobId}` });
    });

    return () => {
      socket.off("new_job_available");
      socket.off("new_bid");
      socket.off("bid_accepted");
    };
  }, [user]);
};