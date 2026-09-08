import jsQR from 'jsqr';

export interface DecodedUPI {
  upiId?: string;
  merchantName?: string;
  rawUrl: string;
  amount?: string;
  currency?: string;
  note?: string;
}

/**
 * Parses UPI parameters from a standard upi://pay URI or similar string
 */
export function parseUpiString(raw: string): DecodedUPI {
  let upiId: string | undefined;
  let merchantName: string | undefined;
  let amount: string | undefined;
  let currency: string = 'INR';
  let note: string | undefined;

  try {
    // If it's a URL like upi://pay?pa=abc@upi&pn=Name...
    if (raw.startsWith('upi://') || raw.includes('?')) {
      const queryString = raw.includes('?') ? raw.split('?')[1] : raw.replace('upi://pay', '');
      const params = new URLSearchParams(queryString);
      upiId = params.get('pa') || undefined;
      merchantName = params.get('pn') ? decodeURIComponent(params.get('pn')!) : undefined;
      amount = params.get('am') || undefined;
      currency = params.get('cu') || 'INR';
      note = params.get('tn') ? decodeURIComponent(params.get('tn')!) : undefined;
    } else if (/^[\w.\-_]+@[\w]+$/.test(raw.trim())) {
      // Direct UPI ID string
      upiId = raw.trim();
    }
  } catch (e) {
    console.warn('Error parsing UPI string:', e);
  }

  return {
    upiId,
    merchantName,
    amount,
    currency,
    note,
    rawUrl: raw,
  };
}

/**
 * Decodes a QR code from an uploaded Image file using an HTML5 Canvas and jsQR
 */
export async function decodeQRFromFile(file: File): Promise<{ success: boolean; data?: DecodedUPI; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve({ success: false, error: 'Could not initialize canvas context' });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          const parsed = parseUpiString(code.data);
          resolve({
            success: true,
            data: parsed,
          });
        } else {
          // Fallback if direct scan failed: try scaling down if huge
          if (canvas.width > 1200 || canvas.height > 1200) {
            const scale = Math.min(800 / canvas.width, 800 / canvas.height);
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = canvas.width * scale;
            smallCanvas.height = canvas.height * scale;
            const smallCtx = smallCanvas.getContext('2d');
            if (smallCtx) {
              smallCtx.drawImage(img, 0, 0, smallCanvas.width, smallCanvas.height);
              const smallData = smallCtx.getImageData(0, 0, smallCanvas.width, smallCanvas.height);
              const smallCode = jsQR(smallData.data, smallData.width, smallData.height, {
                inversionAttempts: 'attemptBoth',
              });
              if (smallCode && smallCode.data) {
                resolve({ success: true, data: parseUpiString(smallCode.data) });
                return;
              }
            }
          }
          resolve({
            success: false,
            error: 'No QR code could be detected in this image. Please ensure the QR is clear or enter the UPI ID manually.',
          });
        }
      };
      img.onerror = () => {
        resolve({ success: false, error: 'Failed to load image file.' });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file.' });
    };
    reader.readAsDataURL(file);
  });
}
