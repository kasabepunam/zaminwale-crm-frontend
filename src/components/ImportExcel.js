import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

function ImportExcel() {
    const [data, setData] = useState([]);

    // Excel फाइल वाचणे
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            setData(jsonData);
        };
        reader.readAsBinaryString(file);
    };

    // Backend कडे डेटा save करणे
    const handleUpload = async () => {
        try {
            await axios.post("http://localhost:5000/api/customers/import", { customers: data });
            alert("✅ Excel Data Imported Successfully!");
        } catch (err) {
            console.error(err);
            alert("❌ Import Failed!");
        }
    };

    return (
        <div>
            <h2>📥 Import Customers from Excel</h2>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
            <button onClick={handleUpload}>Upload to CRM</button>

            {/* Preview */}
            {data.length > 0 && (
                <table border="1" style={{ marginTop: "20px" }}>
                    <thead>
                    <tr>
                        {Object.keys(data[0]).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {Object.values(row).map((val, i) => (
                                <td key={i}>{val}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ImportExcel;
