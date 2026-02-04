// src/context/CustomerContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// 🔹 Create Context
export const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ LAN-ready BASE URL
  const BASE_URL = "http://192.168.29.50:5001/api/customers";

  // 🔹 Fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL);
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Add customer
  const addCustomer = async (customer) => {
    try {
      const res = await axios.post(BASE_URL, customer);
      setCustomers((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Error adding customer:", err);
      throw err;
    }
  };

  // 🔹 Update customer
  const updateCustomer = async (id, updatedCustomer) => {
    try {
      const res = await axios.put(`${BASE_URL}/${id}`, updatedCustomer);
      setCustomers((prev) =>
        prev.map((c) => (c._id === id ? res.data : c))
      );
      return res.data;
    } catch (err) {
      console.error("Error updating customer:", err);
      throw err;
    }
  };

  // 🔹 Delete customer
  const deleteCustomer = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error deleting customer:", err);
      throw err;
    }
  };

  // 🔹 On component mount, fetch customers
  useEffect(() => {
    fetchCustomers();
  }, []);

  // 🔹 Context Provider return
  return (
    <CustomerContext.Provider
      value={{
        customers,
        setCustomers,
        loading,
        fetchCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
