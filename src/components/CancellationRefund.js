import React, { useEffect, useState } from "react";
import axios from "axios";

function CancellationRefund() {
    const [refunds, setRefunds] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/customers/refunds")
            .then(res => setRefunds(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2>Cancellation Refunds</h2>
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Refund Amount</th>
                    <th>Refund Date</th>
                </tr>
                </thead>
                <tbody>
                {refunds.map(r => (
                    <tr key={r._id}>
                        <td>{r.name}</td>
                        <td>{r.mobile}</td>
                        <td>₹{r.refundAmount}</td>
                        <td>{new Date(r.refundDate).toLocaleDateString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default CancellationRefund;
