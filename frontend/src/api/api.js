import axios from "axios";

// Route base API
// Update the baseURL to match your backend API URL
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
