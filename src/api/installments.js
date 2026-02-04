// Fetch all installments for a customer
export const fetchInstallmentsByCustomer = async (customerId) => {
    try {
        const res = await fetch(`http://localhost:5000/api/installments/${customerId}`);
        if (!res.ok) throw new Error("Failed to fetch installments");
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
};


// Add new installment
export const addInstallment = async (installmentData) => {
    try {
        const response = await fetch(`http://localhost:5000/api/installments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(installmentData),
        });
        if (!response.ok) throw new Error("Failed to add installment");
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error adding installment:", err);
        return null;
    }
};
