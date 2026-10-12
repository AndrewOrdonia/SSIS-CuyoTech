export const peso = (n) =>
  "P" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(String(value).replace(" ", "T"));
  return isNaN(d) ? value : d.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
};

export const ordinal = (n) => {
  const num = Number(n);
  if (!num) return "";
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return `${num}${s[(v - 20) % 10] || s[v] || s[0]} Year`;
};
