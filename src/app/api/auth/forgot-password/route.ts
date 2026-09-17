
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {

  
    return NextResponse.json(
      {
        success: true,
        message: "User login successfully",
        data: null,
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