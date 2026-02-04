import * as XLSX from "xlsx";

// Format date as DD-MM-YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const exportMonthlyReport = (customers) => {
  const headers = [
    "SR NO", "DATE", "CUST ID", "CUSTOMER NAME", "BK/INSTALLMENT",
    "LOCATION", "BOOKING AREA", "RATE", "TOTAL AMOUNT", "BK/INSTALL AMOUNT",
    "INCENTIVE RATE", "AMT", "CALLING", "SITE VISIT", "ATTENDING", "CLOSING",
    "AASMA MAM","NILESH SIR","SHALAKA MAM","JAVED PATHAN","PRITEE . D",
    "AVADHUT","SUVARNA","CHAITANYA","SIDDHESH","MAHENDRA","OMI GHARAT",
    "RAKHI","SANDHYA","SNEHAL","VRUSHALI","JYOTI","YASH","SRINIVAS",
    "PRATHAM","SHAILA","SHESHNATH SIR","BHAGYASHREE","RITESH","RAVI D.",
    "PRERNA","ASHOK BANSODE","AADINATH","NASREEN","JITESH","AKSHAY","TOTAL"
  ];

  const data = customers.map((cust, index) => {
    // Employee columns auto-fill 0/1
    const employeeColumns = headers.slice(16, -1).map(emp => (
      cust.callingBy?.includes(emp) || cust.siteVisitBy?.includes(emp) ||
      cust.attendingBy?.includes(emp) || cust.closingBy?.includes(emp) ? 1 : 0
    ));

    const totalEmployees = employeeColumns.reduce((a,b)=>a+b, 0);

    // Calculate Installments total
    const installmentsTotal = cust.installments?.reduce((sum, i) => sum + i.amount, 0) || 0;

    // Use first installment value as BK/INSTALLMENT if needed, else customize
    const firstInstallment = cust.installments && cust.installments.length > 0 ? cust.installments[0].amount : "";

    return [
      index + 1,
      formatDate(cust.date),
      cust.customerId,
      cust.name,
      firstInstallment,             // BK/INSTALLMENT
      cust.location,
      cust.bookingArea,
      cust.rate,
      cust.totalAmount,             // TOTAL AMOUNT
      installmentsTotal,            // BK/INSTALL AMOUNT
      "", // INCENTIVE RATE
      "", // AMT
      cust.callingBy?.join("/") || "",
      cust.siteVisitBy?.join("/") || "",
      cust.attendingBy?.join("/") || "",
      cust.closingBy?.join("/") || "",
      ...employeeColumns,
      totalEmployees
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Optional: adjust column widths
  const colWidths = headers.map(() => ({ wpx: 120 })); // width in pixels
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");
  XLSX.writeFile(workbook, "Monthly_Report.xlsx");
};
