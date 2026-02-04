// CustomerPreview.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import EditCustomerModal from "./EditCustomerModal.js";
import "./CustomerPreview.css";

// =================== DATE FORMAT FUNCTION ===================
const formatDMY = (rawDate) => {
  if (!rawDate) return "-";
  if (typeof rawDate === "string" && rawDate.match(/^\d{2}-\d{2}-\d{4}$/)) return rawDate;
  const date = new Date(rawDate);
  if (isNaN(date)) return rawDate;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

function CustomerPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Get customer ID from URL
  const [currentCustomer, setCurrentCustomer] = useState(location.state?.customer || null);
  const [expandedInstallments, setExpandedInstallments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const user = location.state?.user || JSON.parse(localStorage.getItem("user")) || {};

  // =================== Fetch customer if not passed via state ===================
  useEffect(() => {
    if (!currentCustomer && id) {
      axios.get(`http://192.168.29.50:5001/api/customers/${id}`)
        .then(res => setCurrentCustomer(res.data))
        .catch(err => {
          console.error(err);
          alert("Customer not found!");
          navigate(-1);
        });
    }
  }, [currentCustomer, id, navigate]);

  if (!currentCustomer) {
    return (
      <div className="preview-container">
        <h2>Loading Customer...</h2>
      </div>
    );
  }

  const toggleInstallments = () => setExpandedInstallments(prev => !prev);
  const handleEditSave = (updatedCustomer) => setCurrentCustomer(updatedCustomer);

// =================== Premium PDF Download (Final Fixed) ===================
const downloadInvoice = async () => {
  try {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    /* ---------- Load Logo From Public ---------- */
    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();

        img.crossOrigin = "anonymous";

        img.onload = () => resolve(img);
        img.onerror = () => reject("Logo not found!");

        img.src = src;
      });

    // ✅ Correct path for public folder
const logo = await loadImage(process.env.PUBLIC_URL + "/zaminlogo.png");

    /* ---------- Header ---------- */
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.addImage(logo, "PNG", 15, 5, 18, 18);

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Zaminwale Pvt. Ltd.", 40, 18);

    doc.setFontSize(11);
    doc.text("Customer Report", pageWidth - 15, 18, {
      align: "right",
    });

    doc.setTextColor(0, 0, 0);

   /* ---------- Logo Watermark (Safe) ---------- */
   const addWatermark = () => {
     const wmWidth = 120;
     const wmHeight = 120;

     const x = (pageWidth - wmWidth) / 2;
     const y = (pageHeight - wmHeight) / 2;

     doc.saveGraphicsState();

     // Watermark opacity (light)
     doc.setGState(new doc.GState({ opacity: 0.05 }));

     doc.addImage(logo, "PNG", x, y, wmWidth, wmHeight);

     doc.restoreGraphicsState();
   };



    /* ---------- Title ---------- */
    const leftMargin = 25;
    const rightMargin = pageWidth - 25;

    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");

    doc.text("Customer Full Details", pageWidth / 2, 42, {
      align: "center",
    });

    doc.setLineWidth(0.7);
    doc.line(leftMargin, 47, rightMargin, 47);

    doc.setFont("helvetica", "normal");

    /* ---------- Customer Info ---------- */
    const details = [
      ["Date", formatDMY(currentCustomer.date)],
      ["Customer ID", currentCustomer.customerId],
      ["Name", currentCustomer.name],
[
  "Phone",
  user && user.role === "admin"
    ? currentCustomer.phone
    : "**********",
],

      ["Address", currentCustomer.address],
      ["Aadhar", currentCustomer.aadharCard],
      ["PAN", currentCustomer.panCard],
      ["Booking Area", currentCustomer.bookingArea],
      ["Rate", currentCustomer.rate],
      ["Total Amount", currentCustomer.totalAmount],
      ["Booking Amount", currentCustomer.bookingAmount],
      ["Received Amount", currentCustomer.receivedAmount],
      ["Balance Amount", currentCustomer.balanceAmount],
      ["Status", currentCustomer.status],
      ["Remark", currentCustomer.remark],
    ];

    autoTable(doc, {
      startY: 55,

      head: [["Field", "Value"]],
      body: details,

      theme: "striped",

      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 11,
      },

      styles: {
        fontSize: 10,
        cellPadding: 4,
      },

      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold" },
        1: { cellWidth: 110 },
      },

      didDrawPage: () => {
        addWatermark();
      },
    });

    /* ---------- Installments ---------- */
    let finalY = doc.lastAutoTable.finalY + 12;

    // Required height (Title + Table space)
    const requiredSpace = 25;

    // If not enough space → New Page
    if (finalY + requiredSpace > pageHeight - 20) {
      doc.addPage();
      finalY = 25;
    }

    if (currentCustomer.installments?.length > 0) {

      doc.setFontSize(14);
      doc.text("Installment Details", 15, finalY);

      finalY += 6; // move cursor down


      const rows = currentCustomer.installments.map((i, idx) => [
        idx + 1,
        formatDMY(i.installmentDate),
        i.installmentAmount || "-",
        i.receivedAmount || "-",
        i.balanceAmount || "-",
        i.bankName || "-",
        i.paymentMode || "-",
        i.chequeNo || "-",
        formatDMY(i.chequeDate),
        i.status || "-",
      ]);

     autoTable(doc, {
       startY: finalY,

       head: [
         [
           "No",
           "Date",
           "Amount",
           "Received",
           "Balance",
           "Bank",
           "Mode",
           "UTR / Cheque",
           "Cheque Date",
           "Status",
         ],
       ],

       body: rows,

       theme: "grid",

       // ✅ Header style (single line)
       headStyles: {
         fillColor: [52, 152, 219],
         textColor: 255,
         fontSize: 9,
         halign: "center",
         valign: "middle",
         whiteSpace: "nowrap",   // 👈 no break
       },

       // ✅ Body style
       styles: {
         fontSize: 8,
         cellPadding: 2,
         halign: "center",
         valign: "middle",
         whiteSpace: "nowrap",   // 👈 no break
       },

       // ✅ Column Width Control
       columnStyles: {
         0: { cellWidth: 10 },  // No
         1: { cellWidth: 20 },  // Date
         2: { cellWidth: 18 },  // Amount
         3: { cellWidth: 20 },  // Received
         4: { cellWidth: 18 },  // Balance
         5: { cellWidth: 15 },  // Bank
         6: { cellWidth: 15 },  // Mode
         7: { cellWidth: 32 },  // UTR / Cheque
         8: { cellWidth: 22 },  // Cheque Date
         9: { cellWidth: 15 },  // Status
       },

       didDrawPage: () => {
         addWatermark();
       },
     });

    }

    /* ---------- Page Numbers ---------- */
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setFontSize(9);

      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    }

    /* ---------- Signature ---------- */
    doc.setFontSize(11);

    doc.text(
      "Authorized Signature",
      pageWidth - 25,
      pageHeight - 25,
      { align: "right" }
    );

    doc.line(
      pageWidth - 70,
      pageHeight - 28,
      pageWidth - 20,
      pageHeight - 28
    );

    /* ---------- Save ---------- */
    doc.save(`Customer_${currentCustomer.customerId}_Premium_Report.pdf`);

  } catch (err) {
    console.error("PDF Error:", err);
    alert("Error");
  }
};


  // =================== Print Function ===================
  const printInvoice = () => {
    const printWindow = window.open("", "_blank");
    const installmentsRows = (currentCustomer.installments || [])
      .map((inst, idx) => `
      <tr>
        <td>${idx+1}</td>
        <td>${formatDMY(inst.installmentDate)}</td>
        <td>${inst.installmentAmount || "-"}</td>
        <td>${inst.receivedAmount || "-"}</td>
        <td>${inst.balanceAmount || "-"}</td>
        <td>${inst.bankName || "-"}</td>
        <td>${inst.paymentMode || "-"}</td>
        <td>${inst.chequeNo || "-"}</td>
        <td>${formatDMY(inst.chequeDate)}</td>
        <td>${inst.status || "-"}</td>
        <td>${inst.remark || "-"}</td>
      </tr>`).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Details</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            div { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #000; padding: 5px; text-align: center; font-size: 12px; }
            th { background-color: #2980b9; color: white; }
          </style>
        </head>
        <body>
          <h2>Customer Full Details</h2>
          ${Object.entries(currentCustomer)
            .filter(([key,val]) => typeof val !== "object" || val===null)
            .map(([key,val]) => {
              if(["date","chequeDate","stampDutyDate"].includes(key))
                return `<div><b>${key}:</b> ${formatDMY(val)}</div>`;
              return `<div><b>${key}:</b> ${val || "-"}</div>`;
            }).join("")}
          <h3>Installments</h3>
          <table>
            <thead>
              <tr>
                <th>Sr No</th><th>Date</th><th>Amount</th><th>Received</th><th>Balance</th>
                <th>Bank</th><th>Mode</th><th>Cheque No/UTR</th><th>Cheque Date</th>
                <th>Status</th><th>Remark</th>
              </tr>
            </thead>
            <tbody>${installmentsRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // =================== JSX ===================
  return (
    <div className="preview-container">
      <h2>Customer Details: {currentCustomer.name}</h2>

      {/* Customer Info Grid */}
      <div className="customer-info-grid">
        {[
          ["Date", formatDMY(currentCustomer.date)],
          ["Customer ID", currentCustomer.customerId],
          ["Name", currentCustomer.name],
          ["Address", currentCustomer.address],
[
  "Phone",
  user && user.role === "admin"
    ? currentCustomer.phone
    : "**********",
],
          ["Aadhar", currentCustomer.aadharCard],
          ["PAN", currentCustomer.panCard],
          ["Booking Area", currentCustomer.bookingArea],
          ["Rate", currentCustomer.rate],
          ["Total Amount", currentCustomer.totalAmount],
          ["Booking Amount", currentCustomer.bookingAmount],
          ["Received Amount", currentCustomer.receivedAmount],
          ["Balance", currentCustomer.balanceAmount],
          ["Discount", currentCustomer.discount],
          ["Stamp Duty", currentCustomer.stampDutyCharges],
          ["Stamp Duty Date", formatDMY(currentCustomer.stampDutyDate)],
          ["Stamp Duty Payment Mode", currentCustomer.stampDutyPaymentMode],
          ["Mou Charge", currentCustomer.mouCharge],
          ["Location", currentCustomer.location],
          ["Village", currentCustomer.village],
          ["Bank", currentCustomer.bankName],
          ["Payment Mode", currentCustomer.paymentMode],
          ["Cheque No / UTR No", currentCustomer.chequeNo],
          ["Cheque Date", formatDMY(currentCustomer.chequeDate)],
          ["Remark", currentCustomer.remark],
          ["Status", currentCustomer.status],
          ["Calling By", currentCustomer.callingBy],
          ["Attending By", currentCustomer.attendingBy],
          ["Site Visit By", currentCustomer.siteVisitBy],
          ["Closing By", currentCustomer.closingBy],
          ["Paid By Customer ID", currentCustomer.paidByCustomerId],
          ["Cross Payment", currentCustomer.crossPaymentFlag ? "Yes" : "No"],
        ].map(([label,value],idx)=>(
          <div className="info-row" key={idx}><b>{label}:</b> {value || "-"}</div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{marginTop: "20px"}}>
        <button className="download-btn" onClick={downloadInvoice}>Download PDF</button>
        {user?.role === "admin" && (
          <button className="download-btn" onClick={()=>setShowEditModal(true)} style={{marginLeft:"10px"}}>Edit Customer</button>
        )}
        <button className="download-btn" onClick={printInvoice} style={{marginLeft:"10px"}}>Print</button>
      </div>

      {/* Installments Table */}
      <div className="installments-section">
        <button className="toggle-btn" onClick={toggleInstallments}>
          {expandedInstallments ? "Hide Installments" : `Show Installments (${currentCustomer.installments?.length || 0})`}
        </button>
        {expandedInstallments && currentCustomer.installments?.length > 0 && (
          <table className="installments-table">
            <thead>
              <tr>
                <th>Sr No</th><th>Date</th><th>Amount</th><th>Received</th><th>Balance</th>
                <th>Bank</th><th>Mode</th><th>Cheque No / UTR No</th><th>Cheque Date</th>
                <th>Status</th><th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomer.installments.map((inst, idx)=>(
                <tr key={idx}>
                  <td>{idx+1}</td>
                  <td>{formatDMY(inst.installmentDate)}</td>
                  <td>{inst.installmentAmount || "-"}</td>
                  <td>{inst.receivedAmount || "-"}</td>
                  <td>{inst.balanceAmount || "-"}</td>
                  <td>{inst.bankName || "-"}</td>
                  <td>{inst.paymentMode || "-"}</td>
                  <td>{inst.chequeNo || "-"}</td>
                  <td>{formatDMY(inst.chequeDate)}</td>
                  <td>{inst.status || "-"}</td>
                  <td>{inst.remark || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button className="back-btn" onClick={()=>navigate(-1)}>← Back</button>

      {/* Edit Customer Modal */}
      {user?.role === "admin" && (
        <EditCustomerModal
          show={showEditModal}
          onClose={()=>setShowEditModal(false)}
          customer={currentCustomer}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

export default CustomerPreview;
