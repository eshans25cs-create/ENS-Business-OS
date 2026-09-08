export interface PasswordRequirement {
  label: string;
  met: boolean;
  regex: RegExp;
}

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, error: 'Email is required' };
  if (!emailRegex.test(email)) return { valid: false, error: 'Invalid email format' };
  return { valid: true };
};

export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!username) return { valid: false, error: 'Username is required' };
  if (username.length < 3) return { valid: false, error: 'Username must be at least 3 characters' };
  if (username.length > 30) return { valid: false, error: 'Username must be at most 30 characters' };
  if (!usernameRegex.test(username)) return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; requirements: PasswordRequirement[]; error?: string } => {
  const requirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', met: password.length >= 8, regex: /.{8,}/ },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password), regex: /[A-Z]/ },
    { label: 'Lowercase letter', met: /[a-z]/.test(password), regex: /[a-z]/ },
    { label: 'Number', met: /[0-9]/.test(password), regex: /[0-9]/ },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password), regex: /[^A-Za-z0-9]/ }
  ];

  const allMet = requirements.every(req => req.met);
  if (!password) return { valid: false, requirements, error: 'Password is required' };
  if (!allMet) return { valid: false, requirements, error: 'Password does not meet all requirements' };
  return { valid: true, requirements };
};

export const validateUpiId = (upiId: string): { valid: boolean; error?: string } => {
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  if (!upiId) return { valid: false, error: 'UPI ID is required' };
  if (!upiRegex.test(upiId)) return { valid: false, error: 'Invalid UPI ID format' };
  return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (!phone) return { valid: false, error: 'Phone number is required' };
  if (!phoneRegex.test(cleanPhone)) return { valid: false, error: 'Invalid Indian phone number format' };
  return { valid: true };
};

export const validateFullName = (name: string): { valid: boolean; error?: string } => {
  if (!name) return { valid: false, error: 'Full name is required' };
  if (name.trim().length < 2) return { valid: false, error: 'Full name must be at least 2 characters' };
  return { valid: true };
};
