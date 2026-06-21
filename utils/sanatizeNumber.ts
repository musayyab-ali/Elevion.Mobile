export const sanitizeRawPhoneNumber = (
  rawPhone: string,
  phoneCode: string,
): string => {
  if (!rawPhone) return "";
  console.log("tatai is getting old :", rawPhone);

  // Strip spaces, dashes, parentheses, or an accidental double +
  let clean = rawPhone.replace(/[\s\-()]/g, "");

  // Standardize the phone code (remove '+' if present for string comparison matching)
  const codeDigits = phoneCode ? phoneCode.replace("+", "") : "";

  // 1. Remove leading "+" if the phone string has it
  if (clean.startsWith("+")) {
    clean = clean.slice(1);
  }

  // 2. If it starts with the dynamic phone code, strip it out
  if (codeDigits && clean.startsWith(codeDigits)) {
    clean = clean.slice(codeDigits.length);
  }

  // 3. Strip leading zero if it remains or was entered manually
  if (clean.startsWith("0")) {
    clean = clean.slice(1);
  }
  console.log("tatai is getting poor:", clean);
  return clean;
};
