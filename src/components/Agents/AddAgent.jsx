import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditAgent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        role: "",
        status: "Active",
    });

    // Fetch existing agent data
    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/agents/${id}`);
                setFormData(res.data);
            } catch (error) {
                console.error("Error fetching agent:", error);
            }
        };
        fetchAgent();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/agents/${id}`, formData);
            alert("Agent updated successfully!");
            navigate("/agents");
        } catch (error) {
            console.error("Error updating agent:", error);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Edit Agent</h1>
            <form className="bg-white p-6 rounded shadow-md max-w-md" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />
                <input
                    type="text"
                    name="mobile"
                    placeholder="Mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />
                <input
                    type="text"
                    name="role"
                    placeholder="Role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full mb-3 p-2 border rounded"
                />
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full mb-3 p-2 border rounded"
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Update Agent
                </button>
            </form>
        </div>
    );
};

export default EditAgent;
