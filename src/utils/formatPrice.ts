export function formatPrice(
  price: string | number,
  includeCurrencySymbol: boolean = true
): string {
  const num = Number(price);
  if (isNaN(num)) return "৳0.00";

  return num.toLocaleString("en-BD", {
    style: includeCurrencySymbol ? "currency" : "decimal",
    currency: "BDT",
    currencyDisplay: "narrowSymbol", // This will show the '৳' symbol
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}