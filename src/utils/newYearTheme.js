export const isNewYearThemeActive = () => {
  const today = new Date();
  const month = today.getMonth(); // Jan = 0
  const day = today.getDate();

  return month === 0 && (day === 1 || day === 2);
};
