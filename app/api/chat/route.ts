import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log("Fetching chat history for user:", userId);

    const chatHistory = await prisma.userChatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // console.log("Chat history retrieved:", chatHistory);
    return NextResponse.json(chatHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, message, modelUsed } = await req.json();

    console.log("Received user message:", message);

    // Simulated AI response (Replace with real API call if needed)
    const aiResponse = "Hello! How can I assist you?";

    console.log("Generated AI response:", aiResponse);

    // Save user message & AI response to database
    await prisma.userChatHistory.create({
      data: {
        userId,
        message,
        response: aiResponse,
        modelUsed,
        starred: false,
      },
    });

    return NextResponse.json({ response: aiResponse }, { status: 201 });
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
