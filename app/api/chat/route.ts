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

    let aiResponse = "";

    if (modelUsed === "gpt2-medium") {
      try {
        // Call Hugging Face's inference API when using gpt2-medium
        const hfResponse = await fetch(
          "https://api-inference.huggingface.co/models/gpt2-medium",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Ensure your API key is stored securely in an environment variable
              Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            },
            // Hugging Face expects the text input under the "inputs" key
            body: JSON.stringify({ inputs: message }),
          }
        );

        if (!hfResponse.ok) {
          aiResponse =
            "Error Fetching Response. Please try after some time or switch your model";
        } else {
          const hfData = await hfResponse.json();
          // Since Hugging Face returns an array of objects, we extract the first generated_text
          if (Array.isArray(hfData) && hfData.length > 0) {
            aiResponse = hfData[0].generated_text;
          } else {
            aiResponse = "No generated text returned from Hugging Face";
          }
        }
      } catch (error) {
        console.error("Error fetching from Hugging Face:", error);
        aiResponse =
          "Error Fetching Response. Please try after some time and switch your model";
      }
    } else {
      // Simulated AI response (replace with real logic as needed)
      aiResponse = "Hello! How can I assist you? This is a dummy reponse";
    }

    console.log("Generated AI response:", aiResponse);

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
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
