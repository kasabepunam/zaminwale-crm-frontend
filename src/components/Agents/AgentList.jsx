import React, { useEffect, useState } from "react";
import axios from "axios";

const AgentList = () => {
    const [agents, setAgents] = useState([]);

    const fetchAgents = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/agents");
            setAgents(res.data);
        } catch (error) {
            console.error("Error fetching agents:", error);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const deleteAgent = async (id) => {
        if (window.confirm("Are you sure you want to delete this agent?")) {
            try {
                await axios.delete(`http://localhost:5000/api/agents/${id}`);
                fetchAgents(); // Refresh list
            } catch (error) {
                console.error("Error deleting agent:", error);
            }
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Agents List</h1>
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-blue-500 text-white">
                <tr>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Mobile</th>
                    <th className="py-2 px-4">Role</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Actions</th>
                </tr>
                </thead>
                <tbody>
                {agents.map((agent) => (
                    <tr key={agent._id} className="border-b hover:bg-gray-100">
                        <td className="py-2 px-4">{agent.name}</td>
                        <td className="py-2 px-4">{agent.email}</td>
                        <td className="py-2 px-4">{agent.mobile}</td>
                        <td className="py-2 px-4">{agent.role}</td>
                        <td className="py-2 px-4">{agent.status}</td>
                        <td className="py-2 px-4 space-x-2">
                            <button className="bg-green-500 text-white px-2 py-1 rounded">Edit</button>
                            <button
                                onClick={() => deleteAgent(agent._id)}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AgentList;
