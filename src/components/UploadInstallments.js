import React, { useState } from "react";
import axios from "axios";

function UploadInstallments() {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a CSV file");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("http://localhost:5000/api/installments/upload-installments", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert(res.data.message);
        } catch (err) {
            console.error(err);
            alert("Error uploading file");
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-md bg-white">
            <h2 className="text-lg font-bold mb-3">Upload Installments CSV</h2>
            <input type="file" accept=".csv" onChange={handleFileChange} className="mb-2" />
            <button
                onClick={handleUpload}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Upload
            </button>
        </div>
    );
}

export default UploadInstallments;
