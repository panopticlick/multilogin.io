import { Resend } from 'resend';

// Initialize Resend lazily to avoid build-time errors
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'Multilogin.io <noreply@multilogin.io>';
const APP_NAME = 'Multilogin.io';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://multilogin.io';

// Email templates
export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 0;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; line-height: 48px; color: white; font-size: 24px;">✨</div>
                <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 700; color: #18181b;">${APP_NAME}</h1>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">Reset your password</h2>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                Hi${name ? ` ${name}` : ''},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>

              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${resetUrl}"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #71717a;">
                This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
              </p>

              <p style="margin: 0 0 32px; font-size: 14px; line-height: 22px; color: #71717a;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #6366f1; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #a1a1aa; text-align: center;">
                &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
                <a href="${APP_URL}" style="color: #6366f1;">multilogin.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Reset your ${APP_NAME} password

Hi${name ? ` ${name}` : ''},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.

- The ${APP_NAME} Team
    `.trim(),
  });

  if (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send email');
  }

  return data;
}

export async function sendVerificationEmail(email: string, token: string, name?: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Verify your ${APP_NAME} email address`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 0;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; line-height: 48px; color: white; font-size: 24px;">✨</div>
                <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 700; color: #18181b;">${APP_NAME}</h1>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">Welcome to ${APP_NAME}!</h2>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                Hi${name ? ` ${name}` : ''},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                Thanks for signing up! Please verify your email address to get started:
              </p>

              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${verifyUrl}"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 32px; font-size: 14px; line-height: 22px; color: #71717a;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verifyUrl}" style="color: #6366f1; word-break: break-all;">${verifyUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #a1a1aa; text-align: center;">
                &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
                <a href="${APP_URL}" style="color: #6366f1;">multilogin.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Welcome to ${APP_NAME}!

Hi${name ? ` ${name}` : ''},

Thanks for signing up! Please verify your email address by clicking the link below:

${verifyUrl}

- The ${APP_NAME} Team
    `.trim(),
  });

  if (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send email');
  }

  return data;
}

export async function sendTeamInviteEmail(
  email: string,
  inviterName: string,
  teamName: string,
  token: string
) {
  const inviteUrl = `${APP_URL}/invite?token=${token}`;

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${inviterName} invited you to join ${teamName} on ${APP_NAME}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 0;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; line-height: 48px; color: white; font-size: 24px;">✨</div>
                <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 700; color: #18181b;">${APP_NAME}</h1>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">You're invited!</h2>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                <strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> on ${APP_NAME}.
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                ${APP_NAME} helps teams manage multiple browser profiles securely with cloud sync, real-time collaboration, and advanced anti-detection features.
              </p>

              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${inviteUrl}"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #71717a;">
                This invitation will expire in <strong>7 days</strong>.
              </p>

              <p style="margin: 0 0 32px; font-size: 14px; line-height: 22px; color: #71717a;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #6366f1; word-break: break-all;">${inviteUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #a1a1aa; text-align: center;">
                &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
                <a href="${APP_URL}" style="color: #6366f1;">multilogin.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
You're invited to join ${teamName} on ${APP_NAME}!

${inviterName} has invited you to join ${teamName}.

${APP_NAME} helps teams manage multiple browser profiles securely with cloud sync, real-time collaboration, and advanced anti-detection features.

Accept the invitation: ${inviteUrl}

This invitation will expire in 7 days.

- The ${APP_NAME} Team
    `.trim(),
  });

  if (error) {
    console.error('Failed to send team invite email:', error);
    throw new Error('Failed to send email');
  }

  return data;
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to ${APP_NAME}!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 0;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; line-height: 48px; color: white; font-size: 24px;">✨</div>
                <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 700; color: #18181b;">Welcome to ${APP_NAME}!</h1>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                Hi${name ? ` ${name}` : ''},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b;">
                Thanks for joining ${APP_NAME}! We're excited to have you on board.
              </p>

              <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #18181b;">Here's what you can do next:</h3>

              <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 28px; color: #52525b;">
                <li>Create your first browser profile</li>
                <li>Download the desktop client</li>
                <li>Configure your proxy settings</li>
                <li>Invite team members</li>
              </ul>

              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${APP_URL}/dashboard"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 32px; font-size: 14px; line-height: 22px; color: #71717a;">
                Need help getting started? Check out our <a href="${APP_URL}/docs" style="color: #6366f1;">documentation</a> or reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #a1a1aa; text-align: center;">
                &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
                <a href="${APP_URL}" style="color: #6366f1;">multilogin.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Welcome to ${APP_NAME}!

Hi${name ? ` ${name}` : ''},

Thanks for joining ${APP_NAME}! We're excited to have you on board.

Here's what you can do next:
- Create your first browser profile
- Download the desktop client
- Configure your proxy settings
- Invite team members

Go to your dashboard: ${APP_URL}/dashboard

Need help getting started? Check out our documentation at ${APP_URL}/docs or reply to this email.

- The ${APP_NAME} Team
    `.trim(),
  });

  if (error) {
    console.error('Failed to send welcome email:', error);
    throw new Error('Failed to send email');
  }

  return data;
}
