import bcrypt from "bcryptjs";
import crypto from "crypto"
import { NextResponse } from "next/server";
// import ejs from "ejs";
// import path from "path"
// import { transporter } from "@/lib/nodemailer";
import config from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { connectRedis } from "@/lib/radis";

export async function POST(request: Request) {
  try {
    console.log("HELLO JS");
    const formData = await request.formData();
    const title = formData.get("title");
    const emailValue = formData.get("email");
    const passwordValue = formData.get("password");
    const description = formData.get("description");
    const shortDescription = formData.get("shortDescription");
    const tagline = formData.get("tagline");
    const phone = formData.get("phone");
    const website = formData.get("website");
    const whatsapp = formData.get("whatsapp");
    const addressLine1 = formData.get("addressLine1");
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");
    const establishedYear = formData.get("establishedYear");

    const listing = {
      description,
      shortDescription,
      tagline,
      phone,
      website,
      whatsapp,
      addressLine1,
      latitude,
      longitude,
      establishedYear
    }

    if (typeof emailValue !== "string" || !emailValue.trim()) {
      throw new Error("Email not found");
    }
    if (typeof passwordValue !== "string" || !passwordValue.trim()) {
      throw new Error("Password not found");
    }
    const email = emailValue.trim().toLowerCase();
    const password = passwordValue;

    const isUserExists = await prisma.user.findUnique({
      where: { email },
    });

    if (isUserExists) {
      throw new Error("User with this email already exists");
    }



    // hasing password
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    console.log({ hashedPassword });


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
        value: expireTime,
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