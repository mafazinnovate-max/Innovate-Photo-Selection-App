import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const { name, email, rating, message, website } = await req.json();

    if (website) return NextResponse.json({ success: true }); // honeypot

    const stars = Number(rating);
    if (!name || !message || !(stars >= 1 && stars <= 5)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Picknovate Reviews" <${process.env.SMTP_USER}>`,
      to: process.env.REVIEW_TO_EMAIL,
      replyTo: email || undefined,
      subject: `New ${stars}★ review from ${name}`,
      html: `
        <h2>New customer review</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email || "Not provided")}</p>
        <p><b>Rating:</b> ${"★".repeat(stars)}${"☆".repeat(5 - stars)} (${stars}/5)</p>
        <p><b>Review:</b></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Review email error:", err);
    return NextResponse.json({ error: "Failed to send review" }, { status: 500 });
  }
}