// src/components/UploadExcel.js
import React, { useState } from "react";
import axios from "axios";

function UploadExcel() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message + " (" + res.data.count + " records)");
    } catch (err) {
      console.error(err);
      setMessage("Upload failed!");
    }
  };

  return (
    <div>
      <h2>Upload Excel / CSV</h2>
      <input type="file" accept=".xlsx, .csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
}

export default UploadExcel;
