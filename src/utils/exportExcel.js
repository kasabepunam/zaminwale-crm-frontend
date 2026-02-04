import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ================= DATE HELPERS ================= */

/* Convert any date → JS Date (Excel readable) */
const parseToExcelDate = (value) => {
  if (!value) return null;

  // already Date
  if (value instanceof Date) return value;

  // dd-mm-yyyy
  if (typeof value === "string" && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [dd, mm, yyyy] = value.split("-");
    return new Date(yyyy, mm - 1, dd);
  }

  const d = new Date(value);
  return isNaN(d) ? null : d;
};

/* ================= CORE EXPORT ================= */

/**
 * Export multiple sheets to Excel
 * @param {Array} sheets - [{ sheetName, data }]
 */
export const exportToExcel = (sheets) => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ sheetName, data }) => {
    if (!data || data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(data, {
      cellDates: true   // ✅ IMPORTANT
    });

    /* ================= DATE FORMAT FIX ================= */
    const range = XLSX.utils.decode_range(ws["!ref"]);

    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellRef];

        if (cell && cell.v instanceof Date) {
          cell.t = "d";               // date type
          cell.z = "dd-mm-yyyy";      // ✅ Excel format
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  });

  const wbout = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellDates: true
  });

  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    "CustomerData.xlsx"
  );
};

/* ================= CUSTOMERS + INSTALLMENTS ================= */

export const exportCustomersWithInstallments = (customers) => {

  /* ---------- CUSTOMERS SHEET ---------- */
  const customersData = customers.map(c => ({
    Date: parseToExcelDate(c.date),
    "Customer ID": c.customerId || "-",
    Name: c.name || "-",
    Address: c.address || "-",
    Phone: c.phone || "-",
    Aadhar: c.aadharCard || "-",
    PAN: c.panCard || "-",
    "Booking Area": c.bookingArea || "-",
    Rate: c.rate || "-",
    "Total Amount": c.totalAmount || "-",
    "Booking Amount": c.bookingAmount || "-",
    "Received Amount": c.receivedAmount || "-",
    Balance: c.balanceAmount || "-",
    "Stamp Duty": c.stampDutyCharges || "-",
    Location: c.location || "-",
    Village: c.village || "-",
    "Mou Charge": c.mouCharge || "-",
    Bank: c.bankName || "-",
    "Payment Mode": c.paymentMode || "-",
    "Cheque No": c.chequeNo || "-",
    "Cheque Date": parseToExcelDate(c.chequeDate),
    Remark: c.remark || "-",
    Status: c.status || "-",
    "Calling By": Array.isArray(c.callingBy) ? c.callingBy.join(" / ") : "-",
    "Attending By": Array.isArray(c.attendingBy) ? c.attendingBy.join(" / ") : "-",
    "Site Visiting By": Array.isArray(c.siteVisitBy) ? c.siteVisitBy.join(" / ") : "-",
    "Closing By": Array.isArray(c.closingBy) ? c.closingBy.join(" / ") : "-"
  }));

  /* ---------- INSTALLMENTS SHEET ---------- */
  const installmentsData = [];

  customers.forEach(c => {
    if (c.installments?.length > 0) {
      c.installments.forEach(inst => {
        installmentsData.push({
          "Customer ID": c.customerId,
          "Installment No": inst.installmentNo || "-",
          Date: parseToExcelDate(inst.installmentDate),
          Amount: inst.installmentAmount || "-",
          Received: inst.receivedAmount || "-",
          Balance: inst.balanceAmount || "-",
          Bank: inst.bankName || "-",
          Mode: inst.paymentMode || "-",
          "Cheque No / UTR": inst.chequeNo || "-",
          "Cheque Date": parseToExcelDate(inst.chequeDate),
          "Clear Date": parseToExcelDate(inst.clearDate),
          Remark: inst.remark || "-",
          Status: inst.status || "-"
        });
      });
    }
  });

  /* ---------- EXPORT ---------- */
  exportToExcel([
    { sheetName: "Customers", data: customersData },
    { sheetName: "Installments", data: installmentsData }
  ]);
};
