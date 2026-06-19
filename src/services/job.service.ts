import api from "./api";

// GET JOBS (feed)
export const getJobs = async () => {
  const res = await api.get("/jobs");
  return res.data;
};

// CREATE JOB (CLIENT)
export const createJob = async (data: {
  title: string;
  description: string;
  budget: number;
}) => {
  const res = await api.post("/jobs", data);
  return res.data;
};