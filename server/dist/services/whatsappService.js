"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderWhatsApp = void 0;
const twilio_1 = __importDefault(require("twilio"));
const isTwilioConfigured = () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    return !!(sid && token && from && !sid.includes('<') && !token.includes('<') && !from.includes('<'));
};
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
});
const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
/**
 * Normalises an Indian phone number to E.164 WhatsApp format.
 * Handles: +91xxxxxxxxxx, 91xxxxxxxxxx, 0xxxxxxxxxx, xxxxxxxxxx (10 digits)
 */
const normalisePhone = (phone) => {
    const digits = phone.replace(/[\s\-().+]/g, '');
    if (digits.startsWith('91') && digits.length === 12)
        return `+${digits}`;
    if (digits.startsWith('0') && digits.length === 11)
        return `+91${digits.slice(1)}`;
    if (digits.length === 10)
        return `+91${digits}`;
    if (digits.startsWith('+'))
        return digits; // already E.164
    return null;
};
const sendOrderWhatsApp = async (data) => {
    if (!isTwilioConfigured()) {
        console.warn('⚠️  Twilio credentials not configured — WhatsApp notifications disabled.');
        return;
    }
    const toPhone = normalisePhone(data.customerPhone);
    if (!toPhone) {
        console.warn(`⚠️  Invalid phone number for WhatsApp: ${data.customerPhone}`);
        return;
    }
    const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const fromWhatsApp = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;
    const toWhatsApp = `whatsapp:${toPhone}`;
    const paymentLabel = data.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '📲 QR Code Payment';
    const message = `🛍️ *MANIVYA – Order Confirmed!*\n` +
        `Hi ${data.customerName}! Your order is confirmed ✅\n\n` +
        `📦 *Order:* ${data.orderNumber}\n` +
        `🔍 *Tracking:* ${data.trackingNumber}\n` +
        `🛒 *Items:* ${data.itemCount} item${data.itemCount !== 1 ? 's' : ''}\n` +
        `💰 *Total:* ${formatCurrency(data.totalAmount)}\n` +
        `${paymentLabel}\n` +
        `🚀 *Est. Delivery:* ${formatDate(data.estimatedDelivery)}\n\n` +
        `Track your order anytime at:\n` +
        `👉 ${process.env.CLIENT_URL || 'http://localhost:5173'}/orders\n\n` +
        `Thank you for choosing MANIVYA Enterprises! 🙏\n` +
        `_Manojavam Multi Enterprises_`;
    try {
        await client.messages.create({
            from: fromWhatsApp,
            to: toWhatsApp,
            body: message,
        });
        console.log(`📱 WhatsApp confirmation sent to ${toPhone}`);
    }
    catch (err) {
        console.error('❌ Failed to send WhatsApp message:', err.message);
    }
};
exports.sendOrderWhatsApp = sendOrderWhatsApp;
