import axios from "axios";

const BASE_URL = "http://localhost:5000/api/staff";

const token = localStorage.getItem("token"); // login token

const config = {
  headers: { Authorization: `Bearer ${token}` },
};

// GET all staff (admin)
export const getAllStaff = () => axios.get(`${BASE_URL}/get-all`, config);

// GET single staff
export const getStaff = (id) => axios.get(`${BASE_URL}/${id}`, config);

// ADD staff
export const addStaff = (data) =>
  axios.post(`${BASE_URL}/add`, data, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
  });

// EDIT staff
export const editStaff = (id, data) =>
  axios.put(`${BASE_URL}/edit/${id}`, data, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
  });

// DELETE staff (admin)
export const deleteStaff = (id) =>
  axios.delete(`${BASE_URL}/delete/${id}`, config);