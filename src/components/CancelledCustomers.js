import React, { useEffect, useState } from "react";
import axios from "axios";

function CancelledCustomers() {
    const [cancelled, setCancelled] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/customers/cancelled")
            .then(res => setCancelled(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2>Cancelled Customers</h2>
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Cancellation Date</th>
                    <th>Reason</th>
                </tr>
                </thead>
                <tbody>
                {cancelled.map(c => (
                    <tr key={c._id}>
                        <td>{c.name}</td>
                        <td>{c.mobile}</td>
                        <td>{new Date(c.cancelDate).toLocaleDateString()}</td>
                        <td>{c.cancelReason}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default CancelledCustomers;
