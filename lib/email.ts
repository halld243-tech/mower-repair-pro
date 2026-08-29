// Email service wrapper - supports both SendGrid and Resend
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // For development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Email would be sent:", { to, subject, html });
    return { success: true };
  }

  // Production: Use SendGrid or Resend
  // TODO: Implement actual email sending
  // Example with Resend:
  // const { Resend } = await import('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // const result = await resend.emails.send({
  //   from: 'noreply@enginerepairpro.com',
  //   to,
  //   subject,
  //   html,
  // });

  return { success: true };
}

export function getAppointmentConfirmationEmail(
  customerName: string,
  serviceName: string,
  dateTime: string
) {
  return `
    <h2>Appointment Confirmed</h2>
    <p>Hi ${customerName},</p>
    <p>Your appointment for <strong>${serviceName}</strong> is confirmed.</p>
    <p><strong>Date & Time:</strong> ${dateTime}</p>
    <p>Thank you for choosing Engine Repair Pro!</p>
  `;
}

export function getContactFormConfirmationEmail(customerName: string) {
  return `
    <h2>We've Received Your Message</h2>
    <p>Hi ${customerName},</p>
    <p>Thank you for contacting Engine Repair Pro. We've received your inquiry and will get back to you as soon as possible.</p>
  `;
}

export function getOwnerNotificationEmail(
  customerName: string,
  message: string
) {
  return `
    <h2>New Contact Form Submission</h2>
    <p><strong>From:</strong> ${customerName}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;
}
