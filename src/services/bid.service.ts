import api from "./api";

// PLACE BID (TECHNICIAN)
export const createBid = async (jobId: number, amount: number) => {
  const res = await api.post(`/jobs/${jobId}/bids`, {
    amount,
  });

  return res.data;
};

// ACCEPT BID (CLIENT)
export const acceptBid = async (jobId: number, bidId: number) => {
  const res = await api.patch(
    `/jobs/${jobId}/bids/${bidId}/accept`
  );

  return res.data;
};