import type { SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import config from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { connectRedis } from "@/lib/radis";
import { jwtUtils } from "@/utils/jwt";
import { UserRole, UserStatus } from "../../../../../generated/prisma/enums";

export async function POST(request: Request) {
  try {

    const cookieStore  = await cookies()
    const payload = await request.json();

    const { email, otp } = payload;

    const existsUser = await prisma.user.findUnique(
      {
        where: {
          email,
        }
      }
    )



    if (existsUser?.isVerified) {
      throw new Error("Email already verifyed")
    }


    if (existsUser?.status === UserStatus.BLOCKED) {
      throw new Error("User is blocked");
    }

    if (existsUser?.status === UserStatus.DELETED) {
      throw new Error("User is deleted");
    }




    const redis = await connectRedis();
    // Verify OTP
    const verifyOtpKey = `verify-email-otp:${email}`
    const redisOtp = await redis.get(verifyOtpKey);
    if (!redisOtp) {
      throw new Error("Invalid OTP")
    }

    if (redisOtp !== otp) {
      throw new Error("OTP does not match")
    }
    await redis.del(verifyOtpKey)


    // register data
    const registerUserKey = `register-user-data:${email}`
    const radisUserData = await redis.get(registerUserKey);
    if (!radisUserData) {
      throw new Error("User Doesnt Exists ")
    }
    const userPayload = JSON.parse(radisUserData)


    const createdUser = await prisma.user.create({
      data: {
        name: userPayload?.name,
        email: userPayload.email,
        password: userPayload.password,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isVerified: true,
        listings: {
          create: {
            title: userPayload.name,
            email: userPayload.email,
            description : userPayload.listing.description || '',
            slug: userPayload.listing.description,
          },
        },
      },
      omit: { password: true },
      include: { listings: true },
    });

    await redis.del(registerUserKey)

    const { listings, ...user } = createdUser;
    const jwtPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwtUtils.createToken(
      jwtPayload,
      config.jwt_access_secret,
      config.jwt_access_expires_in as SignOptions,
    );


    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });


    return NextResponse.json(
      {
        success: true,
        message: "Verification successfully",
        data: {accessToken,user},
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