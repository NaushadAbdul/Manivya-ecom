import nodemailer from 'nodemailer';

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  trackingNumber: string;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress: {
    fullAddress: string;
    city: string;
    state: string;
    postalCode: string;
  };
  estimatedDelivery: Date;
  paymentMethod: string;
}

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || user.includes('<') || pass.includes('<')) {
    console.warn('⚠️  SMTP credentials not configured — email notifications disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

const buildEmailHtml = (data: OrderEmailData): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmation – ${data.orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#0B0F17;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F17;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#131B2E;border-radius:20px;overflow:hidden;border:1px solid #1E2A45;max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px 36px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">MANIVYA</h1>
            <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Manojavam Multi Enterprises</p>
          </td>
        </tr>

        <!-- Success Banner -->
        <tr>
          <td style="background:#0D1B12;padding:20px 36px;text-align:center;border-bottom:1px solid #1E2A45;">
            <div style="display:inline-block;background:#065F46;border-radius:50px;padding:8px 20px;">
              <span style="color:#34D399;font-size:13px;font-weight:700;">✅ &nbsp;Order Placed Successfully!</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="color:#CBD5E1;font-size:15px;margin:0 0 8px;">Hi <strong style="color:#fff;">${data.customerName}</strong>,</p>
            <p style="color:#94A3B8;font-size:14px;margin:0 0 28px;line-height:1.6;">
              Thank you for shopping with MANIVYA! Your order has been confirmed and our team is already preparing your items for dispatch.
            </p>

            <!-- Order Details Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F17;border-radius:14px;border:1px solid #1E2A45;margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:12px;">Order Details</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;font-size:13px;padding:4px 0;">Order Number</td>
                    <td style="color:#fff;font-size:13px;font-weight:700;text-align:right;">${data.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;font-size:13px;padding:4px 0;">Tracking Number</td>
                    <td style="color:#818CF8;font-size:13px;font-weight:700;text-align:right;">${data.trackingNumber}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;font-size:13px;padding:4px 0;">Payment</td>
                    <td style="color:#fff;font-size:13px;font-weight:600;text-align:right;">${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'QR Code Payment'}</td>
                  </tr>
                  <tr>
                    <td style="color:#94A3B8;font-size:13px;padding:4px 0;">Est. Delivery</td>
                    <td style="color:#34D399;font-size:13px;font-weight:700;text-align:right;">${formatDate(data.estimatedDelivery)}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F17;border-radius:14px;border:1px solid #1E2A45;margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <p style="color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">Items Ordered</p>
                ${data.items.map(item => `
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                    <tr>
                      <td style="color:#E2E8F0;font-size:13px;font-weight:600;">${item.name} <span style="color:#64748B;font-weight:400;">× ${item.quantity}</span></td>
                      <td style="color:#A5B4FC;font-size:13px;font-weight:700;text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  </table>
                `).join('')}
                <hr style="border:none;border-top:1px solid #1E2A45;margin:14px 0;"/>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#fff;font-size:16px;font-weight:900;">Total Paid</td>
                    <td style="color:#34D399;font-size:18px;font-weight:900;text-align:right;">${formatCurrency(data.totalAmount)}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Delivery Address -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F17;border-radius:14px;border:1px solid #1E2A45;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="color:#64748B;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Delivering to</p>
                <p style="color:#E2E8F0;font-size:14px;margin:0;line-height:1.6;">
                  ${data.shippingAddress.fullAddress},<br/>
                  ${data.shippingAddress.city}, ${data.shippingAddress.state} – ${data.shippingAddress.postalCode}
                </p>
              </td></tr>
            </table>

            <p style="color:#64748B;font-size:12px;line-height:1.7;margin:0;">
              Questions? Reply to this email or WhatsApp us. We'll respond within minutes.<br/>
              <strong style="color:#818CF8;">Team MANIVYA</strong> — Manojavam Multi Enterprises
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#070A10;padding:20px 36px;text-align:center;border-top:1px solid #1E2A45;">
            <p style="color:#334155;font-size:11px;margin:0;">© 2026 Manojavam Multi Enterprises. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const sendOrderConfirmationEmail = async (data: OrderEmailData): Promise<void> => {
  const transporter = createTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"MANIVYA Enterprises" <${process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `✅ Order Confirmed – ${data.orderNumber} | MANIVYA`,
      html: buildEmailHtml(data),
    });
    console.log(`📧 Order confirmation email sent to ${data.customerEmail}`);
  } catch (err) {
    console.error('❌ Failed to send order email:', (err as Error).message);
  }
};
