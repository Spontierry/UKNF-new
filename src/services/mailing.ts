import { mailClient } from "@/lib/mail-client";

export async function sendEmail(email: string, subject: string, body: string) {
  await mailClient.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: email,
    subject,
    html: body,
  });
}
