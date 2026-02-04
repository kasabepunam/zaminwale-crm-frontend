// src/services/api.js
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api", // backend base URL
});

// Example APIs
export const getCustomers = () => API.get("/customers");
export const addCustomer = (data) => API.post("/customers", data);

export default API;
