"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDefinedAdminEmail = exports.ADMIN_EMAILS = void 0;
exports.ADMIN_EMAILS = [
    'admin@manivya.com',
    'naushadabdul2006@gmail.com',
];
const isDefinedAdminEmail = (email) => {
    if (!email)
        return false;
    const lower = email.toLowerCase().trim();
    if (lower.includes('admin'))
        return true;
    if (exports.ADMIN_EMAILS.includes(lower))
        return true;
    if (process.env.ADMIN_EMAILS) {
        const list = process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
        if (list.includes(lower))
            return true;
    }
    return false;
};
exports.isDefinedAdminEmail = isDefinedAdminEmail;
