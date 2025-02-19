"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../elements/toggle-mode";
import { Input } from "../ui/input";
import { ModelOptions } from "../elements/model-options";
import { Star } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLLMStore } from "@/store/llm-store";
import Link from "next/link";

export default function HomePage() {
  const { selectedModel } = useLLMStore();
  const [chatHistory, setChatHistory] = useState<
    {
      id: string;
      message: string;
      response: string;
      modelUsed: string;
      starred: boolean;
      createdAt: string;
    }[]
  >([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history & starred messages on page load
  useEffect(() => {
    const fetchChatAndStarredMessages = async () => {
      try {
        console.log("Fetching chat history...");
        const chatRes = await fetch("/api/chat?userId=1");
        if (!chatRes.ok) throw new Error("Failed to fetch chat history");
        const chatData = await chatRes.json();

        console.log("Fetching starred messages...");
        const starredRes = await fetch("/api/starred?userId=1");
        // starredRes returns { response: starredMessages }
        const starredResult = starredRes.ok
          ? await starredRes.json()
          : { response: [] };
        const starredData = Array.isArray(starredResult.response)
          ? starredResult.response
          : [];

        console.log("Fetched chat:", chatData);
        console.log("Fetched starred messages:", starredData);

        // Sort chat data by createdAt (oldest first)
        const sortedChatData = chatData.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Merge starred status: mark a chat as starred if a starred record exists whose userChatHistoryId matches msg.id.
        const updatedChatHistory = sortedChatData.map((msg: any) => ({
          ...msg,
          starred: starredData.some(
            (starred: any) => starred.userChatHistoryId === msg.id
          ),
        }));

        setChatHistory(updatedChatHistory);
      } catch (error) {
        console.error("Error loading chat and starred messages:", error);
      }
    };

    fetchChatAndStarredMessages();
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const messageId = Date.now().toString();
    const userMessage = {
      id: messageId,
      message: input,
      response: "",
      modelUsed: selectedModel || "Model 1",
      starred: false,
      createdAt: new Date().toISOString(),
    };

    // Append the new message immediately
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      console.log("Sending message:", input, "with model:", selectedModel);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "1",
          message: input,
          modelUsed: selectedModel || "Model 1",
        }),
      });

      if (!response.ok) throw new Error("Failed to save message");

      const data = await response.json();
      console.log("Received AI response:", data);

      // Update the corresponding message with the AI response
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, response: data.response } : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setLoading(false);
    setInput("");
  };

  // Handle toggling star status using userChatHistoryId
  const handleToggleStarMessage = async (
    userChatHistoryId: string,
    currentlyStarred: boolean
  ) => {
    try {
      const payload = { userId: "1", userChatHistoryId };
      console.log("Sending star/unstar request with payload:", payload);

      const res = await fetch("/api/starred", {
        method: currentlyStarred ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to toggle star");
      }

      console.log("Message star status updated successfully");

      // Re-fetch starred messages and update chatHistory starred status
      const starredRes = await fetch("/api/starred?userId=1");
      const starredResult = starredRes.ok
        ? await starredRes.json()
        : { response: [] };
      const starredData = Array.isArray(starredResult.response)
        ? starredResult.response
        : [];

      setChatHistory((prev) =>
        prev.map((msg) => ({
          ...msg,
          starred: starredData.some(
            (starred: any) => starred.userChatHistoryId === msg.id
          ),
        }))
      );
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[100dvh] flex flex-col justify-center items-center space-y-12">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="flex flex-row justify-between items-center gap-5">
        <h1 className="font-bold text-2xl">
          {selectedModel.length ? selectedModel : "Chat with me"}
        </h1>
        <Link href="/starred">
          <button className="bg-blue-500 text-white p-2 rounded-md">
            Starred Messages
          </button>
        </Link>
      </div>

      <div className="relative max-w-xl w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto">
        {chatHistory.map((entry) => (
          <div key={entry.id} className="flex flex-col space-y-2">
            {entry.message && (
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white p-2 rounded-lg max-w-[75%]">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {entry.message}
                  </Markdown>
                </div>
              </div>
            )}
            {entry.response && (
              <div className="flex justify-start items-center">
                <div
                  className={`p-2 rounded-lg max-w-[75%] transition-all ${
                    entry.starred
                      ? "bg-yellow-300 text-black"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {entry.response}
                  </Markdown>
                </div>
                <button
                  onClick={() =>
                    handleToggleStarMessage(entry.id, entry.starred)
                  }
                  className={`ml-2 ${
                    entry.starred ? "text-yellow-500" : "text-gray-500"
                  } hover:text-yellow-500`}
                >
                  <Star size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="max-w-xl w-full fixed bottom-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex flex-row w-full items-end gap-2"
        >
          <ModelOptions />
          <Input
            placeholder="Type your message here."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" disabled={loading || !input.length}>
            {loading ? "Sending..." : "Send message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
