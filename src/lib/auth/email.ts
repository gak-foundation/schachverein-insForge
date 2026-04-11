import { Queue, Worker } from "bullmq";
import { getRedisConnection } from "@/lib/auth/redis";
import { emailVerificationTemplate, passwordResetTemplate } from "@/lib/email/templates";

interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let emailQueue: Queue<EmailJobData> | null = null;

export function getEmailQueue(): Queue<EmailJobData> | null {
  if (emailQueue) return emailQueue;

  const connection = getRedisConnection();
  if (!connection) {
    console.warn("[Email] Redis not available — emails will be logged to console");
    return null;
  }

  emailQueue = new Queue<EmailJobData>("email", { connection });
  return emailQueue;
}

export function startEmailWorker(): Worker<EmailJobData> | null {
  const connection = getRedisConnection();
  if (!connection) return null;

  const worker = new Worker<EmailJobData>(
    "email",
    async (job) => {
      const { to, subject, html, text } = job.data;
      await sendEmailDirect(to, subject, html, text);
    },
    { connection },
  );

  worker.on("failed", (job, err) => {
    console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

export async function sendEmailDirect(to: string, subject: string, html: string, text: string): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log("[Email] SMTP not configured, logging email instead:");
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Text: ${text}`);
    return;
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort || "587"),
    secure: parseInt(smtpPort || "587") === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@schachverein.example.com",
    to,
    subject,
    html,
    text,
  });
}

export async function enqueueEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  const queue = getEmailQueue();
  if (queue) {
    await queue.add("send-email", { to, subject, html, text }, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
  } else {
    await sendEmailDirect(to, subject, html, text);
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;
  const { subject, html, text } = emailVerificationTemplate(verificationUrl);
  await enqueueEmail(email, subject, html, text);
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
  const { subject, html, text } = passwordResetTemplate(resetUrl);
  await enqueueEmail(email, subject, html, text);
}