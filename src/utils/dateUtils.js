// src/utils/dateUtils.js

/* ================= DATE PARSER =================
   Supports:
   - ISO (2024-01-10)
   - DD.MM.YYYY
   - DD/MM/YYYY
   - Mongo Date
*/
export const parseAnyDate = (raw) => {
  if (!raw) return null;

  // Already Date
  if (raw instanceof Date) {
    return isNaN(raw) ? null : raw;
  }

  // DD.MM.YYYY
  if (typeof raw === "string" && raw.includes(".")) {
    const [dd, mm, yyyy] = raw.split(".");
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d) ? null : d;
  }

  // DD/MM/YYYY
  if (typeof raw === "string" && raw.includes("/")) {
    const [dd, mm, yyyy] = raw.split("/");
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d) ? null : d;
  }

  // ISO or timestamp
  const d = new Date(raw);
  return isNaN(d) ? null : d;
};

/* ================= DAY START ================= */
export const dayStart = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
