export type StrengthLevel = 'empty' | 'weak' | 'fair' | 'medium' | 'strong' | 'very-strong';
export interface PasswordStrengthResult {
  score: number; // 0-5
  level: StrengthLevel;
  label: string;
  color: string; // tailwind color class
  percentage: number; // 0-100
  requirements: { label: string; met: boolean }[];
}

export const analyzePassword = (password: string): PasswordStrengthResult => {
  if (!password) {
    return {
      score: 0,
      level: 'empty',
      label: 'Empty',
      color: 'bg-gray-500',
      percentage: 0,
      requirements: []
    };
  }

  const requirements = [
    { label: '8+ chars', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Lowercase', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special', met: /[^A-Za-z0-9]/.test(password) },
    { label: '12+ chars (bonus)', met: password.length >= 12 },
  ];

  const metCount = requirements.slice(0, 5).filter(r => r.met).length;
  const hasBonus = requirements[5].met;

  let score = metCount;
  if (metCount === 5 && hasBonus) score = 6;

  let level: StrengthLevel = 'empty';
  let label = '';
  let color = '';

  if (score <= 1) {
    level = 'weak';
    label = 'Weak';
    color = 'bg-ens-red';
  } else if (score === 2 || score === 3) {
    level = 'fair';
    label = 'Fair';
    color = 'bg-orange-400';
  } else if (score === 4) {
    level = 'medium';
    label = 'Good';
    color = 'bg-yellow-400';
  } else if (score === 5) {
    level = 'strong';
    label = 'Strong';
    color = 'bg-ens-emerald';
  } else if (score >= 6) {
    level = 'very-strong';
    label = 'Very Strong';
    color = 'bg-ens-blue-glow';
  }

  // Cap score at 5 for percentage calculation
  const clampedScore = Math.min(score, 5);
  
  return {
    score: clampedScore,
    level,
    label,
    color,
    percentage: (clampedScore / 5) * 100,
    requirements
  };
};
