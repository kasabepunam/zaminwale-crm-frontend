import axios from "axios";


const API = axios.create({ baseURL: "http://localhost:5000/api" });


export const addWork = (workDetails) => API.post("/work", { workDetails });
export const getMyWork = () => API.get("/work/me");
export const getAllWork = () => API.get("/work/all");