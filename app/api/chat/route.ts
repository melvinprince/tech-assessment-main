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

    const chatHistory = await prisma.userChatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(chatHistory);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, message, modelUsed } = await req.json();

    let aiResponse = "";

    if (modelUsed === "gpt2-medium") {
      try {
        // Hugging Face's API
        const hfResponse = await fetch(
          "https://api-inference.huggingface.co/models/gpt2-medium",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            },
            body: JSON.stringify({ inputs: message }),
          }
        );
        //hf response is inside generated_text
        if (!hfResponse.ok) {
          aiResponse =
            "Error Fetching Response. Please try after some time or switch your model";
        } else {
          const hfData = await hfResponse.json();
          if (Array.isArray(hfData) && hfData.length > 0) {
            aiResponse = hfData[0].generated_text;
          } else {
            aiResponse = "No generated text returned from Hugging Face";
          }
        }
      } catch (err) {
        aiResponse =
          "Error Fetching Response. Please try after some time and switch your model";
      }
    } else {
      // Sample Model Response
      aiResponse = "Hello! How can I assist you? This is a dummy reponse";
    }

    // Save user message & AI response to the database
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
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
