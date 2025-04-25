/**
 * Format a number with thousands separators
 * @param value The number to format
 * @returns Formatted string with thousands separators
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('ko-KR');
};

/**
 * Format a date string to localized format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Mask account number (hide middle digits)
 * @param accountNumber Account number string
 * @returns Masked account number
 */
export const maskAccountNumber = (accountNumber: string): string => {
  const parts = accountNumber.split('-');
  if (parts.length < 2) return accountNumber;

  // Mask the middle part
  const first = parts[0];
  const last = parts[parts.length - 1];
  const middle = parts
    .slice(1, -1)
    .map((p) => '*'.repeat(p.length))
    .join('-');

  return [first, middle, last].join('-');
};
