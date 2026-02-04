import React, { useState, useContext } from "react";
import axios from "axios";
import { CustomerContext } from "../context/CustomerContext";

function ImportCSV() {
    const { addCustomer } = useContext(CustomerContext);
    const [file, setFile] = useState(null);

    const handleImport = async (e) => {
        e.preventDefault();
        if (!file) return alert("Select CSV file");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("http://localhost:5000/api/csv/import", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            res.data.customers.forEach(c => addCustomer(c));
            alert("CSV Imported Successfully");
        } catch (err) {
            console.error(err);
            alert("Import failed");
        }
    };

    const handleExport = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/csv/export", { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "customers.csv");
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error(err);
            alert("Export failed");
        }
    };

    return (
        <div className="csv-container">
            <h2>📂 Import / Export Customers CSV</h2>
            <form onSubmit={handleImport}>
                <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
                <button type="submit">Import CSV</button>
            </form>
            <button onClick={handleExport}>Export CSV</button>
        </div>
    );
}

export default ImportCSV;
