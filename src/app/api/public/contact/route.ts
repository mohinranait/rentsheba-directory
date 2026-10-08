import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/schemas/contact-schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0]?.message || "Invalid input";
      return NextResponse.json(
        {
          success: false,
          message: firstError,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, phone, subject, message } = result.data;

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || "General Inquiry",
        message,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully. We will get back to you shortly.",
        data: { id: contact.id },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Public contact submit error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send your message. Please try again later.",
      },
      { status: 500 },
    );
  }
}
