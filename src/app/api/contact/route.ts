import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, company, email, phone, service, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "名前とメールアドレスは必須です" },
        { status: 400 }
      );
    }

    await prisma.contact_submissions.create({
      data: { type, name, company, email, phone, service, message },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "エラーが発生しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }
}
