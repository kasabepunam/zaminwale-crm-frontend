import { useEffect, useState } from "react";
import { addWork, getMyWork } from "../../api/workApi";
import axios from "axios";

export default function StaffProfile() {
  const [staff, setStaff] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [workDetails, setWorkDetails] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const resProfile = await axios.get("https://zaminwale-crm-backend-yztw.onrender.com/api/staff/me");
      setStaff(resProfile.data.staff);
      setCustomers(resProfile.data.customers);

      const resWork = await getMyWork();
      setWorkLogs(resWork.data);
    };
    fetchData();
  }, []);

  const handleAddWork = async () => {
    if (!workDetails) return alert("Please enter work details");
    const res = await addWork(workDetails);
    setWorkLogs([res.data, ...workLogs]);
    setWorkDetails("");
  };

  if (!staff) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Profile</h2>
      <p><strong>Name:</strong> {staff.name}</p>
      <p><strong>Designation:</strong> {staff.designation}</p>
      <p><strong>Department:</strong> {staff.department}</p>
      <p><strong>Date of Joining:</strong> {staff.dateOfJoining}</p>
      <p><strong>Email:</strong> {staff.email}</p>
      <p><strong>Phone:</strong> {staff.phone}</p>

      <h3>Add Daily Work</h3>
      <textarea
        value={workDetails}
        onChange={(e) => setWorkDetails(e.target.value)}
        placeholder="Enter your work..."
      />
      <button onClick={handleAddWork}>Add Work</button>

      <h3>My Work Logs</h3>
      <ul>
        {workLogs.map((log) => (
          <li key={log._id}>
            <strong>{log.date}:</strong> {log.workDetails}
          </li>
        ))}
      </ul>

      <h3>My Customers</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Phone</th><th>Address</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.address}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}