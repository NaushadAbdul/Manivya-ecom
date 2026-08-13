export const ADMIN_EMAILS = [
  'mme27082018@gmail.com',
  'admin@manivya.com',
  'naushadabdul2006@gmail.com',
];

export const isDefinedAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  if (ADMIN_EMAILS.includes(lower)) return true;
  if (process.env.ADMIN_EMAILS) {
    const list = process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
    if (list.includes(lower)) return true;
  }
  return false;
};
