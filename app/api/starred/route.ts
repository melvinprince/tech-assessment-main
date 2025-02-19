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

    console.log("Received star request:", userChatHistoryId);

    // Check if the message is already starred using the unique field
    const existingStarred = await prisma.starredPrompts.findUnique({
      where: { userChatHistoryId },
    });

    if (existingStarred) {
      return NextResponse.json(
        { message: "Already starred", existingStarred },
        { status: 200 }
      );
    }

    // Create a new starred entry
    const starredEntry = await prisma.starredPrompts.create({
      data: {
        userId,
        userChatHistoryId,
        starredAt: new Date(),
      },
    });

    return NextResponse.json({ response: starredEntry }, { status: 201 });
  } catch (error) {
    console.error("Error starring message:", error);
    return NextResponse.json(
      { error: "Failed to star message" },
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
    console.log("Fetching starred messages for user:", userId);

    // Attempt to include the relation; if your Prisma client doesn't support it, remove the include.
    const starredMessages = await prisma.starredPrompts.findMany({
      where: { userId },
      // If the relation is not available, comment out the include line:
      include: { userChatHistory: true },
      orderBy: { starredAt: "desc" },
    });
    console.log("Found starred messages:", starredMessages);

    return NextResponse.json({ response: starredMessages }, { status: 200 });
  } catch (error: any) {
    const errorMessage =
      error && error.message ? error.message : "unknown error";
    console.error("Error fetching starred messages:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch starred messages", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.userId || !body.userChatHistoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Received DELETE request:", body);

    // Find the starred record using the unique userChatHistoryId
    const existingStarred = await prisma.starredPrompts.findUnique({
      where: { userChatHistoryId: body.userChatHistoryId },
    });

    if (!existingStarred) {
      return NextResponse.json(
        { error: "Message not found in starred" },
        { status: 404 }
      );
    }

    // Delete the starred record
    await prisma.starredPrompts.delete({
      where: { id: existingStarred.id },
    });

    return NextResponse.json(
      { message: "Message unstarred successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error un-starring message:", error);
    return NextResponse.json(
      { error: "Failed to unstar message" },
      { status: 500 }
    );
  }
}
