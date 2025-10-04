import nodemailer from "nodemailer";

const PORT = Number(process.env.SMTP_PORT) || 1025;

export const mailClient = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
    : undefined,
  tls: { rejectUnauthorized: false },
});
