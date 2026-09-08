export interface UpiUriParams {
  upiId: string;
  name: string;
  amount?: number | string;
  note?: string;
  transactionId?: string;
  currency?: string;
}

/**
 * Builds a standard NPCI UPI URI.
 * CRITICAL: The `pa` (VPA) parameter must NOT have its '@' sign percent-encoded.
 * Encoding '@' as '%40' causes PhonePe, Paytm, and GPay to fail with "Unable to scan QR / technical issue".
 */
export const buildUpiUri = (params: UpiUriParams): string => {
  const { upiId, name, amount, note, transactionId, currency = 'INR' } = params;
  
  // Clean UPI ID without percent-encoding the '@'
  const cleanUpi = upiId.trim();
  const cleanName = encodeURIComponent((name || 'Merchant').trim());
  
  let uri = `upi://pay?pa=${cleanUpi}&pn=${cleanName}&cu=${currency}`;
  
  // Format amount with 2 decimal places if present and greater than 0
  if (amount !== undefined && amount !== null && amount !== '') {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!isNaN(num) && num > 0) {
      uri += `&am=${num.toFixed(2)}`;
    }
  }
  
  if (note) {
    uri += `&tn=${encodeURIComponent(note.trim())}`;
  }
  
  // NPCI reference: alphanumeric only without hyphens or special chars
  if (transactionId) {
    const cleanTr = transactionId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 35);
    if (cleanTr) {
      uri += `&tr=${cleanTr}`;
    }
  }
  
  return uri;
};
