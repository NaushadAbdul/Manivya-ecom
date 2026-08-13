export const ADMIN_EMAILS = [
  'admin@manivya.com',
  'naushadabdul2006@gmail.com',
];

export const isDefinedAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  if (lower.includes('admin')) return true;
  if (ADMIN_EMAILS.includes(lower)) return true;
  if (process.env.ADMIN_EMAILS) {
    const list = process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
    if (list.includes(lower)) return true;
  }
  return false;
};
