import bcrypt from "bcryptjs";
import crypto from "crypto"
import ejs from "ejs";
import { NextResponse } from "next/server";
import path from "path"
import config from "@/lib/config";
import { transporter } from "@/lib/nodemailer";
import { prisma } from "@/lib/prisma";
import { connectRedis } from "@/lib/radis";

export async function POST(request: Request) {
  try {

    const payload = await request.json();

    const { title, password, listing } = payload;
    const email = payload.email.trim().toLowerCase();

    const isUserExists = await prisma.user.findUnique({
      where: { email },
    });

    if (isUserExists) {
      throw new Error("User with this email already exists");
    }

    // hasing password
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));



    const redis = await connectRedis();
    // SET OTP in radis
    const otp = crypto.randomInt(100000, 1000000);
    const verifyOtpKey = `verify-email-otp:${email}`
    const expireTime = 5 * 60;
    await redis.set(verifyOtpKey, otp, {
      expiration: {
        type: "EX",
        value: expireTime,
      }
    })


    // Set listing data
    const registerUserKey = `register-user-data:${email}`
    const radisUserPayload = {
      name: title,
      email,
      password: hashedPassword,
      listing,
    }
    await redis.set(registerUserKey, JSON.stringify(radisUserPayload), {
      expiration: {
        type: "EX",
        value: expireTime ,
      }
    })



    // Send email
    // const templatePath = path.join(process.cwd(), "src/templates/verify-email.ejs")
    // const html = await ejs.renderFile(templatePath, {
    //   name: title,
    //   otp,
    //   expireTime,
    // })
    // await transporter.sendMail({
    //   from: config.email_sender,
    //   to: email,
    //   subject: "Verify Your Email - RentSheba",
    //   html
    // })

    return NextResponse.json(
      {
        success: true,
        message: "Verification OTP sent successfully",
        data: null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}