import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "./ViewCustomer.css";

function ViewCustomer() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const customer = state?.customer;
  const printRef = useRef();

  if (!customer) {
    return (
      <div className="view-customer-container">
        <h2>No Customer Data Found</h2>
        <button onClick={() => navigate(-1)}>⬅ Back</button>
      </div>
    );
  }

  // 🖨 Download PDF Function
  const handleDownloadPDF = async () => {
    const input = printRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${customer.name}_Details.pdf`);
  };

  // 🖨 Print Function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="view-customer-container">
      <div className="header-buttons">
        <button className="back-btn" onClick={() => navigate(-1)}>⬅ Back</button>
        <div className="right-buttons">
          <button className="print-btn" onClick={handlePrint}>🖨 Print</button>
          <button className="pdf-btn" onClick={handleDownloadPDF}>📥 Download PDF</button>
        </div>
      </div>

      <div ref={printRef}>
        <h2>Customer Details</h2>

        <div className="customer-details">
          <div><strong>Date:</strong> {customer.date}</div>
          <div><strong>Customer ID:</strong> {customer.customerId}</div>
          <div><strong>Name:</strong> {customer.name}</div>
          <div><strong>Address:</strong> {customer.address}</div>
          <div><strong>Phone:</strong> {customer.phone}</div>
          <div><strong>Aadhaar:</strong> {customer.aadhaarCard}</div>
          <div><strong>PAN:</strong> {customer.panCard}</div>
          <div><strong>Booking Area:</strong> {customer.bookingArea}</div>
          <div><strong>Rate:</strong> ₹{customer.rate}</div>
          <div><strong>Total Amount:</strong> ₹{customer.totalAmount}</div>
          <div><strong>Booking Amount:</strong> ₹{customer.bookingAmount}</div>
          <div><strong>Received Amount:</strong> ₹{customer.receivedAmount}</div>
          <div><strong>Balance Amount:</strong> ₹{customer.balanceAmount}</div>
          <div><strong>Stamp Duty:</strong> ₹{customer.stampDutyCharges}</div>
          <div><strong>Location:</strong> {customer.location}</div>
          <div><strong>Village:</strong> {customer.village}</div>
          <div><strong>Mou Charge:</strong> ₹{customer.mouCharge}</div>
          <div><strong>Bank:</strong> {customer.bankName}</div>
          <div><strong>Payment Mode:</strong> {customer.paymentMode}</div>
          <div><strong>Cheque No:</strong> {customer.chequeNo}</div>
          <div><strong>Cheque Date:</strong> {customer.chequeDate}</div>
          <div><strong>Remark:</strong> {customer.remark}</div>
          <div><strong>Status:</strong> {customer.status}</div>
          <div><strong>Calling By:</strong> {customer.callingBy}</div>
          <div><strong>Attending By:</strong> {customer.attendingBy}</div>
          <div><strong>Site Visiting By:</strong> {customer.siteVisitBy}</div>
          <div><strong>Closing By:</strong> {customer.closingBy}</div>
        </div>

        <h3>Installment Details</h3>
        {customer.installments && customer.installments.length > 0 ? (
          <table className="installment-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Received</th>
                <th>Balance</th>
                <th>Bank</th>
                <th>Mode</th>
                <th>Cheque No</th>
                <th>Cheque Date</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {customer.installments.map((inst, i) => (
                <tr key={i}>
                  <td>{inst.installmentNo || i + 1}</td>
                  <td>{inst.installmentDate}</td>
                  <td>₹{inst.installmentAmount}</td>
                  <td>₹{inst.receivedAmount}</td>
                  <td>₹{inst.balanceAmount}</td>
                  <td>{inst.bankName}</td>
                  <td>{inst.paymentMode}</td>
                  <td>{inst.chequeNo}</td>
                  <td>{inst.chequeDate}</td>
                  <td>{inst.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No installment data available.</p>
        )}
      </div>
    </div>
  );
}

export default ViewCustomer;
