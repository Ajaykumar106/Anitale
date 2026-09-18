// Mock Email Provider Integration
// In a real production app, you would swap this with Resend, Sendgrid, etc.
// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

import { prisma } from '@/lib/prisma';

export async function sendEmailNotification(
  userId: string, 
  subject: string, 
  htmlContent: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { notificationPref: true }
    });

    if (!user || !user.email) return false;

    // Check if user opted out of email notifications
    if (user.notificationPref && !user.notificationPref.emailNotifications) {
      console.log(`[Email] Skipped sending to ${user.email} (opted out)`);
      return false;
    }

    // MOCK SEND
    console.log(`[Email Sent] To: ${user.email} | Subject: ${subject}`);
    
    // Example Resend Integration:
    // await resend.emails.send({
    //   from: 'Anitale <noreply@anitale.app>',
    //   to: user.email,
    //   subject,
    //   html: htmlContent
    // });
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendNewEpisodeEmail(userId: string, showTitle: string, episodeNumber: number) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6366f1;">New Episode Available!</h2>
      <p>A new episode of <strong>${showTitle}</strong> is now available.</p>
      <p>Episode ${episodeNumber} has just been released.</p>
      <a href="https://anitale.app/watch" style="display: inline-block; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">
        Watch Now
      </a>
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888;">
        You can manage your email preferences in your Anitale Account Settings.
      </p>
    </div>
  `;
  return sendEmailNotification(userId, `New Episode: ${showTitle}`, html);
}
