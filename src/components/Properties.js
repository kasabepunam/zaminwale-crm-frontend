// src/components/Properties.js
import React from "react";

const properties = [
    { name: "Plot A", totalAmount: 2000000 },
    { name: "Plot B", totalAmount: 3000000 },
    { name: "Plot C", totalAmount: 4000000 },
];

const formatLakh = (amount) => `${amount / 100000} lakh`;

function Properties() {
    return (
        <div>
            {properties.map((prop, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                    <h3>{prop.name}</h3>
                    <p>Total Amount: {formatLakh(prop.totalAmount)}</p>
                </div>
            ))}
        </div>
    );
}

export default Properties;
