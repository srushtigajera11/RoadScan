import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

/**
 * Send confirmation email to the citizen after report submission.
 */
export async function sendConfirmationEmail({ to, trackingId, damageType, address, pdfUrl }) {
  if (!to || !process.env.GMAIL_USER) return

  const transporter = createTransporter()

  const formattedDamage = damageType
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Road Damage'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 32px; border-radius: 12px;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 24px; font-weight: bold; color: #ffffff;">🛣️ Road<span style="color: #f97316;">Scan</span></span>
      </div>

      <h2 style="color: #ffffff; margin-bottom: 8px;">Report Submitted Successfully</h2>
      <p style="color: #94a3b8; margin-bottom: 24px;">Your road damage complaint has been logged and forwarded to Surat Municipal Corporation.</p>

      <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Tracking ID</div>
          <div style="font-size: 20px; font-weight: bold; color: #f97316; font-family: monospace;">${trackingId}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Damage Type</div>
          <div style="color: #f1f5f9;">${formattedDamage}</div>
        </div>
        ${address ? `
        <div>
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Location</div>
          <div style="color: #f1f5f9;">${address}</div>
        </div>` : ''}
      </div>

      ${pdfUrl ? `
      <a href="${pdfUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 20px;">
        📄 Download PDF Complaint
      </a>` : ''}

      <p style="color: #64748b; font-size: 12px;">
        Use your Tracking ID to check the status of your report at any time.<br/>
        This is an automated message from RoadScan.
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"RoadScan" <${process.env.GMAIL_USER}>`,
      to,
      subject: `RoadScan — Report ${trackingId} Submitted`,
      html,
    })
    console.log(`✉️  Confirmation email sent to ${to}`)
  } catch (err) {
    // Retry once
    try {
      await transporter.sendMail({
        from: `"RoadScan" <${process.env.GMAIL_USER}>`,
        to,
        subject: `RoadScan — Report ${trackingId} Submitted`,
        html,
      })
    } catch (retryErr) {
      console.warn('Email send failed after retry:', retryErr.message)
      // Do not throw — email failure must not block report storage (NFR-13)
    }
  }
}
