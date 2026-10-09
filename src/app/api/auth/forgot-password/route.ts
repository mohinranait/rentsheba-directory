import crypto from "crypto";
import ejs from "ejs";
import { NextResponse } from "next/server";
import path from "path";
import config from "@/lib/config";
import { transporter } from "@/lib/nodemailer";
import { prisma } from "@/lib/prisma";
import { connectRedis } from "@/lib/radis";
import { getSiteSettings } from "@/lib/settings";

const OTP_EXPIRE_SECONDS = 5 * 60; // 5 minutes

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস দিন",
        },
        { status: 400 },
      );
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি",
        },
        { status: 404 },
      );
    }

    if (user.status === "BLOCKED" || user.status === "DELETED") {
      return NextResponse.json(
        {
          success: false,
          message: "আপনার অ্যাকাউন্টটি স্থগিত বা নিষ্ক্রিয় অবস্থায় রয়েছে",
        },
        { status: 403 },
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const redis = await connectRedis();
    const otpKey = `forgot-password-otp:${email}`;

    await redis.set(otpKey, otp, {
      expiration: {
        type: "EX",
        value: OTP_EXPIRE_SECONDS,
      },
    });

    // Render email template
    const settings = await getSiteSettings();
    const siteName = settings.siteName || "RentSheba";
    const templatePath = path.join(
      process.cwd(),
      "src/templates/forgot-password.ejs",
    );

    const html = await ejs.renderFile(templatePath, {
      name: user.name || "গ্রাহক",
      otp,
      expireTime: Math.floor(OTP_EXPIRE_SECONDS / 60),
      siteName,
      siteTagline: settings.siteTagline,
      headerLogo: settings.headerLogo,
      copyrightText: settings.copyrightText,
    });

    // Send email
    await transporter.sendMail({
      from: config.email_sender,
      to: email,
      subject: `পাসওয়ার্ড রিসেট ওটিপি - ${siteName}`,
      html,
    });

    return NextResponse.json(
      {
        success: true,
        message: "আপনার ইমেইলে ৬-সংখ্যার ভেরিফিকেশন কোড পাঠানো হয়েছে",
        data: { email },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Forgot password request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "কিছু সমস্যা হয়েছে, পুনরায় চেষ্টা করুন",
      },
      { status: 500 },
    );
  }
}