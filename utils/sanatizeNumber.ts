export const sanitizeRawPhoneNumber = (
  rawPhone: string,
  phoneCode: string,
): string => {
  if (!rawPhone) return "";

  let clean = rawPhone.replace(/[\s\-()]/g, "");
  const codeDigits = phoneCode ? phoneCode.replace("+", "") : "";
  if (clean.startsWith("+")) {
    clean = clean.slice(1);
  }

  if (codeDigits && clean.startsWith(codeDigits)) {
    clean = clean.slice(codeDigits.length);
  }

  if (clean.startsWith("0")) {
    clean = clean.slice(1);
  }
  return clean;
};
