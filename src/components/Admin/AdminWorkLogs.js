import { useEffect, useState } from "react";
import { getAllWork } from "../../api/workApi";

export default function AdminWorkLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await getAllWork();
      setLogs(res.data);
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h2>All Staff Work Logs</h2>
      <table>
        <thead>
          <tr>
            <th>Staff Name</th><th>Date</th><th>Work Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{log.staffName}</td>
              <td>{log.date}</td>
              <td>{log.workDetails}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}