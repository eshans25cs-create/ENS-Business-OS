export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | null;
  isRealSmtp?: boolean;
  sentTo?: string;
  error?: string;
}

/**
 * Dispatches an OTP verification email to the user's email inbox
 */
export async function sendOtpEmail(
  email: string, 
  otp: string, 
  fullName?: string, 
  purpose: 'registration' | 'password_reset' = 'registration'
): Promise<SendEmailResult> {
  try {
    const isNative = typeof window !== 'undefined' && (
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && window.navigator.userAgent.includes('wv')) ||
      (window as any).Capacitor?.isNativePlatform?.()
    );

    const baseUrl = isNative ? 'https://photographs-ones-city-submit.trycloudflare.com' : '';

    const response = await fetch(`${baseUrl}/api/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        otp,
        fullName: fullName?.trim(),
        purpose,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || `Server responded with status ${response.status}`,
      };
    }

    const data: SendEmailResult = await response.json();
    return data;
  } catch (err: any) {
    console.warn('Could not reach local email endpoint:', err);
    return {
      success: false,
      error: 'Could not connect to email service. Please check network or try again.',
    };
  }
}

/**
 * Convenience helper to open Gmail directly in a new tab
 */
export function openUserMailbox(email: string) {
  if (email.endsWith('@gmail.com')) {
    window.open('https://mail.google.com/mail/u/0/#inbox', '_blank');
  } else if (email.endsWith('@outlook.com') || email.endsWith('@hotmail.com')) {
    window.open('https://outlook.live.com/mail/0/inbox', '_blank');
  } else if (email.endsWith('@yahoo.com')) {
    window.open('https://mail.yahoo.com', '_blank');
  } else {
    window.open(`mailto:${email}`, '_blank');
  }
}
