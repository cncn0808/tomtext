import axios from "axios";

export const axiosClient = axios.create({
  // baseURL: "https://u8tcq5rvi3.execute-api.ap-southeast-2.amazonaws.com/",
  baseURL: "/api", // Proxy locally or change as needed
  headers: {
    "Content-Type": "application/json",
  },
});


