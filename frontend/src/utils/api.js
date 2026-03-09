import axios from "axios"

const api = axios.create({
    baseURL : import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
    timeout : 15000
})

export const fetchStockData = async(ticker) => {
    const res = await api.get(`/api/stocks/${ticker}`);
    return res.data;
}

export const fetchInsight = async(ticker) => {
    const res = await api.get(`/api/insights/${ticker}`);
    return res.data;
}

export const fetchPortfolio = async () => {
  const res = await api.get("/api/portfolio");
  return res.data;
};

export const addHolding = async (payload) => {
  const res = await api.post("/api/portfolio", payload);
  return res.data;
};

export const deleteHolding = async (id) => {
  const res = await api.delete(`/api/portfolio/${id}`);
  return res.data;
};

export const fetchWatchlist = async () => {
  const res = await api.get("/api/watchlist");
  return res.data;
};

export const addToWatchlist = async (ticker) => {
  const res = await api.post("/api/watchlist", { ticker });
  return res.data;
};

export const removeFromWatchlist = async (ticker) => {
  const res = await api.delete(`/api/watchlist/${ticker}`);
  return res.data;
};

export default api;