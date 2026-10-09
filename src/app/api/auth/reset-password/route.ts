import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import config from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { connectRedis } from "@/lib/radis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();
    const password = body.password;

    if (!email || !otp || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "ইমেইল, ওটিপি এবং নতুন পাসওয়ার্ড আবশ্যক",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে",
        },
        { status: 400 },
      );
    }

    const redis = await connectRedis();
    const otpKey = `forgot-password-otp:${email}`;
    const redisOtp = await redis.get(otpKey);

    if (!redisOtp || redisOtp !== otp) {
      return NextResponse.json(
        {
          success: false,
          message: "ওটিপি কোডটি সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে",
        },
        { status: 400 },
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি",
        },
        { status: 404 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds) || 10,
    );

    // Update password in database
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // Delete used OTP
    await redis.del(otpKey);

    return NextResponse.json(
      {
        success: true,
        message: "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! অনুগ্রহ করে লগইন করুন।",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে",
      },
      { status: 500 },
    );
  }
}
