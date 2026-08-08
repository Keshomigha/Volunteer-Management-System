import nodemailer from "nodemailer";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

let transporter = null;

export const getTransporter = async () => {
  if (transporter) return transporter;

  const smtpHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const smtpPort = process.env.EMAIL_PORT || "587";
  const smtpUser = process.env.EMAIL_USER || "avishkaweerasinghe02@gmail.com";
  const smtpPass = process.env.EMAIL_PASS || "kfxqdvzoqxwzxzjw";

  // Use connection pool for high speed zero-latency sending
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: smtpPort === "465",
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
};

/**
 * Universal ultra-fast email sender using high-reliability pooled Gmail SMTP with Brevo fallback
 */
export const sendEmail = async ({ to, subject, html, text, senderName, senderEmail }) => {
  const defaultSenderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER || "avishkaweerasinghe02@gmail.com";
  const defaultSenderName = process.env.SENDER_NAME || "VolunteerHub Support";

  const fromEmail = senderEmail || defaultSenderEmail;
  const fromName = senderName || defaultSenderName;

  // 1. Primary: Send via Pooled High-Speed SMTP (Gmail App Password - zero latency ~300ms)
  try {
    const mailTransporter = await getTransporter();
    const mailOptions = {
      from: `"${fromName}" <${defaultSenderEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ""),
      html
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[SMTP EMAIL INSTANT DELIVERED] Message ID: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId, provider: "smtp" };
  } catch (smtpError) {
    console.warn(`[SMTP NOTICE] ${smtpError.message}. Attempting Brevo API fallback...`);
  }

  // 2. Fallback: Try Brevo HTTP REST API if configured
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const response = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text || html.replace(/<[^>]+>/g, "")
        })
      });

      const data = await response.json();

      if (response.ok && data.messageId) {
        console.log(`[BREVO API SUCCESS] Email sent to ${to} (Message ID: ${data.messageId})`);
        return { success: true, messageId: data.messageId, provider: "brevo" };
      }
    } catch (apiError) {
      console.error(`[EMAIL DELIVERY FAILED] Could not send email to ${to}:`, apiError.message);
    }
  }

  return { success: false, error: "All email providers failed" };
};

/**
 * 1. Password Reset Email
 */
export const sendPasswordResetEmail = async ({ to, userName, resetUrl, resetOtp }) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 32px 28px; color: #334155; line-height: 1.6; }
        .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e293b; margin: 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 20px 0; text-align: center; }
        .footer { background: #f8fafc; padding: 20px 28px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
        .link-alt { word-break: break-all; color: #3b82f6; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>VolunteerHub</h1>
          <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Password Reset Request</p>
        </div>
        <div class="content">
          <p>Hello <strong>${userName || 'User'}</strong>,</p>
          <p>We received a request to reset the password for your VolunteerHub account. You can use either the button link below or enter your 6-digit OTP verification code.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password Now</a>
          </div>

          <div class="otp-box">
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 6px 0;">Your Verification OTP Code</p>
            <div class="otp-code">${resetOtp}</div>
          </div>

          <p style="font-size: 13px; color: #64748b;">This reset link and OTP code are valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">Or copy and paste this link in your browser:<br/>
            <a href="${resetUrl}" class="link-alt">${resetUrl}</a>
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VolunteerHub Support. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject: "VolunteerHub - Password Reset Code & Link",
    html: htmlTemplate,
    text: `You requested a password reset for VolunteerHub.\n\nYour OTP Code: ${resetOtp}\nReset Link: ${resetUrl}\n\nThis link/code is valid for 1 hour.`
  });
};

/**
 * 2. Welcome Email
 */
export const sendWelcomeEmail = async ({ to, userName, role }) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px 28px; color: #334155; line-height: 1.6; }
        .badge { display: inline-block; background: #d1fae5; color: #047857; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; font-size: 12px; }
        .footer { background: #f8fafc; padding: 20px 28px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Welcome to VolunteerHub! 🎉</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Welcome to VolunteerHub! Your account has been successfully created as a <span class="badge">${role}</span>.</p>
          <p>You can now log in to explore volunteer opportunities, manage events, track participation, and earn certificates!</p>
          <p style="margin-top: 24px;">Thank you for joining our community!</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VolunteerHub Support. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject: "Welcome to VolunteerHub!",
    html: htmlTemplate,
    text: `Hi ${userName},\n\nWelcome to VolunteerHub! Your ${role} account is now active.`
  });
};

/**
 * 3. Application Status Email (Approved / Rejected)
 */
export const sendApplicationStatusEmail = async ({ to, userName, eventTitle, status }) => {
  const isApproved = status === "Approved";
  const bgGradient = isApproved 
    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .header { background: ${bgGradient}; padding: 32px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 32px 28px; color: #334155; line-height: 1.6; }
        .status-box { background: #f8fafc; border-left: 4px solid ${isApproved ? '#10b981' : '#ef4444'}; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px 28px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Application Update</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Your application status for the event <strong>"${eventTitle}"</strong> has been updated:</p>
          
          <div class="status-box">
            <p style="margin: 0; font-size: 16px;">Status: <strong style="color: ${isApproved ? '#059669' : '#dc2626'};">${status}</strong></p>
          </div>

          <p>${isApproved ? "Congratulations! We look forward to your active participation." : "Thank you for your interest. Please check out other upcoming volunteer events on VolunteerHub."}</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VolunteerHub Support. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject: `Application Update: ${eventTitle} - ${status}`,
    html: htmlTemplate,
    text: `Dear ${userName},\n\nYour application for "${eventTitle}" has been ${status}.`
  });
};

/**
 * 4. Certificate Issued Email
 */
export const sendCertificateIssuedEmail = async ({ to, userName, eventTitle, certificateNumber }) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 32px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px 28px; color: #334155; line-height: 1.6; }
        .cert-card { background: #f5f3ff; border: 1px solid #ddd6fe; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .cert-num { font-family: monospace; font-size: 18px; font-weight: 700; color: #6d28d9; letter-spacing: 2px; }
        .footer { background: #f8fafc; padding: 20px 28px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Certificate Issued! 🎓</h1>
        </div>
        <div class="content">
          <p>Congratulations <strong>${userName}</strong>,</p>
          <p>Your official volunteer certificate for <strong>"${eventTitle}"</strong> has been successfully generated.</p>
          
          <div class="cert-card">
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #6d28d9; text-transform: uppercase;">Certificate Number</p>
            <div class="cert-num">${certificateNumber}</div>
          </div>

          <p>You can view and download your certificate directly from your VolunteerHub dashboard.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VolunteerHub Support. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject: `🎓 Certificate Issued for ${eventTitle}`,
    html: htmlTemplate,
    text: `Congratulations ${userName}!\n\nYour certificate (${certificateNumber}) for "${eventTitle}" is now available on your dashboard.`
  });
};

/**
 * 5. Event Notification Email
 */
export const sendEventNotificationEmail = async ({ to, userName, eventTitle, message }) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 32px 28px; color: #334155; line-height: 1.6; }
        .footer { background: #f8fafc; padding: 20px 28px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Event Update: ${eventTitle}</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>${message}</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VolunteerHub Support. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject: `Event Notification: ${eventTitle}`,
    html: htmlTemplate,
    text: `Hi ${userName},\n\n${message}`
  });
};
