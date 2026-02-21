import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zoho.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10)
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const EMAIL_FROM = process.env.EMAIL_FROM || 'support@resume-studio.io'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_USER || !SMTP_PASS) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }
  return transporter
}

export function isEmailConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS)
}

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
  replyTo?: string
}

/**
 * Send an email via SMTP. Fire-and-forget safe — never throws.
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const t = getTransporter()
    if (!t) {
      console.warn('[email] SMTP not configured, skipping email')
      return false
    }
    await t.sendMail({
      from: `"Resume Studio" <${EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    })
    return true
  } catch (err) {
    console.error('[email] Failed to send:', err)
    return false
  }
}

/**
 * Notify support team about a new case.
 */
export async function sendSupportNotification(caseData: {
  caseNumber: string
  name: string | null
  email: string
  subject: string
  message: string
  category: string
}): Promise<void> {
  const { caseNumber, name, email, subject, message, category } = caseData

  // 1. Notify the support team
  await sendEmail({
    to: EMAIL_FROM,
    subject: `[${caseNumber}] New support case: ${subject}`,
    replyTo: email,
    text: [
      `New support case received`,
      ``,
      `Case: ${caseNumber}`,
      `From: ${name || 'Anonymous'} <${email}>`,
      `Category: ${category}`,
      `Subject: ${subject}`,
      ``,
      `Message:`,
      message,
    ].join('\n'),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px;">
        <div style="background: #1A56DB; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; font-size: 18px;">New Support Case ${caseNumber}</h2>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #6b7280; width: 90px;">From</td><td style="padding: 6px 0;">${name || 'Anonymous'} &lt;${email}&gt;</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Category</td><td style="padding: 6px 0; text-transform: capitalize;">${category}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Subject</td><td style="padding: 6px 0; font-weight: 600;">${subject}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>
      </div>
    `,
  })

  // 2. Send confirmation to the user
  await sendEmail({
    to: email,
    subject: `[${caseNumber}] We received your message - Resume Studio`,
    text: [
      `Hi ${name || 'there'},`,
      ``,
      `Thank you for contacting Resume Studio support. We've received your message and assigned it case number ${caseNumber}.`,
      ``,
      `Subject: ${subject}`,
      `Category: ${category}`,
      ``,
      `Our team will review your case and get back to you as soon as possible.`,
      ``,
      `- Resume Studio Support`,
      `https://resume-studio.io`,
    ].join('\n'),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px;">
        <div style="background: #1A56DB; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; font-size: 18px;">We received your message</h2>
        </div>
        <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 14px; color: #374151;">Hi ${name || 'there'},</p>
          <p style="font-size: 14px; color: #374151;">Thank you for contacting Resume Studio support. We've received your message and assigned it case number <strong>${caseNumber}</strong>.</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Subject</p>
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${subject}</p>
          </div>
          <p style="font-size: 14px; color: #374151;">Our team will review your case and get back to you as soon as possible.</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">- Resume Studio Support<br /><a href="https://resume-studio.io" style="color: #1A56DB;">resume-studio.io</a></p>
        </div>
      </div>
    `,
  })
}

/**
 * Notify the user when admin replies to their support case.
 */
export async function sendAdminReplyNotification(replyData: {
  caseNumber: string
  name: string | null
  email: string
  subject: string
  adminNotes: string
  status: string
}): Promise<void> {
  const { caseNumber, name, email, subject, adminNotes, status } = replyData

  const statusLabel = status === 'resolved' ? 'Resolved' : status === 'in_progress' ? 'In Progress' : 'Open'

  await sendEmail({
    to: email,
    subject: `[${caseNumber}] Update on your support case - Resume Studio`,
    text: [
      `Hi ${name || 'there'},`,
      ``,
      `Our team has responded to your support case ${caseNumber}.`,
      ``,
      `Subject: ${subject}`,
      `Status: ${statusLabel}`,
      ``,
      `Response:`,
      adminNotes,
      ``,
      `If you have further questions, you can reply by submitting a new case at https://resume-studio.io/support`,
      ``,
      `- Resume Studio Support`,
      `https://resume-studio.io`,
    ].join('\n'),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px;">
        <div style="background: #1A56DB; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; font-size: 18px;">Update on case ${caseNumber}</h2>
        </div>
        <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 14px; color: #374151;">Hi ${name || 'there'},</p>
          <p style="font-size: 14px; color: #374151;">Our team has responded to your support case.</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 4px 0; color: #6b7280; width: 70px;">Case</td><td style="padding: 4px 0; font-weight: 600;">${caseNumber}</td></tr>
              <tr><td style="padding: 4px 0; color: #6b7280;">Subject</td><td style="padding: 4px 0;">${subject}</td></tr>
              <tr><td style="padding: 4px 0; color: #6b7280;">Status</td><td style="padding: 4px 0;"><span style="background: ${status === 'resolved' ? '#DEF7EC' : '#FEF3C7'}; color: ${status === 'resolved' ? '#03543F' : '#92400E'}; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600;">${statusLabel}</span></td></tr>
            </table>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <div style="font-size: 14px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${adminNotes.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="font-size: 13px; color: #6b7280;">If you have further questions, <a href="https://resume-studio.io/support" style="color: #1A56DB;">submit a new case</a>.</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">- Resume Studio Support<br /><a href="https://resume-studio.io" style="color: #1A56DB;">resume-studio.io</a></p>
        </div>
      </div>
    `,
  })
}
