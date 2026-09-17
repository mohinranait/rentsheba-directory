import bcrypt from "bcryptjs";
import type { SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import config from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { jwtUtils } from "@/utils/jwt";
import { UserStatus } from "../../../../../generated/prisma/enums";

export async function POST(request: Request) {
  try {

    const cookieStore  = await cookies()
    const body = await request.json();

    const {password } = body;

    const email = body.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new Error("User is blocked");
    }

    if (user.status === UserStatus.DELETED) {
      throw new Error("User is deleted");
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      user.password as string,
    );

    if (!isPasswordMatched) {
      throw new Error("Invalid credentials");
    }

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
      // sameSite: "none",
      sameSite: "lax", 
      maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });

    return NextResponse.json(
      {
        success: true,
        message: "User login successfully",
        data: user,
      },
      { status: 200 },
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