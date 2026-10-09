import bcrypt from "bcryptjs";
import crypto from "crypto";
import ejs from "ejs";
import { NextResponse } from "next/server";
import path from "path";
import config from "@/lib/config";
import { transporter } from "@/lib/nodemailer";
import { prisma } from "@/lib/prisma";
import { connectRedis } from "@/lib/radis";
import { getSiteSettings } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const name = (payload.name || payload.title || "").trim();
    const email = (payload.email || "").trim().toLowerCase();
    const password = payload.password;
    const listing = payload.listing;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক",
        },
        { status: 400 },
      );
    }

    const isUserExists = await prisma.user.findUnique({
      where: { email },
    });

    if (isUserExists) {
      return NextResponse.json(
        {
          success: false,
          message: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে",
        },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds) || 10,
    );

    const redis = await connectRedis();
    // SET OTP in redis
    const otp = crypto.randomInt(100000, 1000000);
    const verifyOtpKey = `verify-email-otp:${email}`;
    const expireTime = 5 * 60; // 5 minutes
    await redis.set(verifyOtpKey, otp, {
      expiration: {
        type: "EX",
        value: expireTime,
      },
    });

    // Set registration data in redis
    const registerUserKey = `register-user-data:${email}`;
    const redisUserPayload = {
      name,
      email,
      password: hashedPassword,
      listing,
    };
    await redis.set(registerUserKey, JSON.stringify(redisUserPayload), {
      expiration: {
        type: "EX",
        value: expireTime,
      },
    });

    // Send email
    const settings = await getSiteSettings();
    const siteName = settings.siteName || "RentSheba";
    const templatePath = path.join(
      process.cwd(),
      "src/templates/verify-email.ejs",
    );
    const html = await ejs.renderFile(templatePath, {
      name,
      otp,
      expireTime: Math.floor(expireTime / 60),
      siteName,
      siteTagline: settings.siteTagline,
      headerLogo: settings.headerLogo,
      copyrightText: settings.copyrightText,
    });

    await transporter.sendMail({
      from: config.email_sender,
      to: email,
      subject: `Verify Your Email - ${siteName}`,
      html,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Verification OTP sent successfully",
        data: { email },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Something went wrong",
      },
      { status: 500 },
    );
  }
}