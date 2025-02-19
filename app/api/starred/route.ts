import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, userChatHistoryId } = await req.json();

    if (!userId || !userChatHistoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Directly create a new starred entry
    const starredEntry = await prisma.starredPrompts.create({
      data: {
        userId,
        userChatHistoryId,
        starredAt: new Date(),
      },
    });

    return NextResponse.json({ response: starredEntry }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to star message", details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const starredMessages = await prisma.starredPrompts.findMany({
      where: { userId },
      include: { userChatHistory: true },
      orderBy: { starredAt: "desc" },
    });

    return NextResponse.json({ response: starredMessages }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch starred messages", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, userChatHistoryId } = await req.json();

    if (!userId || !userChatHistoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await prisma.starredPrompts.delete({
      where: { userChatHistoryId },
    });

    return NextResponse.json(
      { message: "Message unstarred successfully" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to unstar message", details: err.message },
      { status: 500 }
    );
  }
}
