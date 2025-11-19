export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isOTPExpired(createdAt: Date, expiryMinutes: number = 10): boolean {
  const now = new Date();
  const diff = now.getTime() - createdAt.getTime();
  return diff > expiryMinutes * 60 * 1000;
}