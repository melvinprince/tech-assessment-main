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
import LoaderMini from "../ui/loadingMini";
import Loader from "../ui/loading";
import { useToast } from "@/hooks/use-toast";

// Define interfaces
interface ChatMessage {
  id: string;
  message: string;
  response: string;
  modelUsed: string;
  starred: boolean;
  createdAt: string;
}

interface StarredRecord {
  id: string;
  userChatHistoryId: string;
  starredAt: string;
  userChatHistory?: ChatMessage;
}

export default function HomePage() {
  const { selectedModel } = useLLMStore();
  const { toast } = useToast(); // Using toast system
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history & starred messages on page load
  useEffect(() => {
    const fetchChatAndStarredMessages = async () => {
      try {
        setLoadingHistory(true);
        const chatRes = await fetch("/api/chat?userId=1");

        if (!chatRes.ok) {
          throw new Error("Failed to fetch chat history");
        }

        const chatData: ChatMessage[] = await chatRes.json();

        const starredRes = await fetch("/api/starred?userId=1");
        const starredResult = starredRes.ok
          ? await starredRes.json()
          : { response: [] };
        const starredData: StarredRecord[] = Array.isArray(
          starredResult.response
        )
          ? starredResult.response
          : [];

        const sortedChatData = chatData.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const updatedChatHistory = sortedChatData.map((msg) => ({
          ...msg,
          starred: starredData.some(
            (starred) => starred.userChatHistoryId === msg.id
          ),
        }));

        setChatHistory(updatedChatHistory);
      } catch (error) {
        //toast
        toast({
          title: "Error",
          description: "Failed to load chat history.",
          variant: "destructive",
        });
      } finally {
        setLoadingHistory(false);
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
    setLoadingChat(true);

    const messageId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: messageId,
      message: input,
      response: "",
      modelUsed: selectedModel || "Model 1",
      starred: false,
      createdAt: new Date().toISOString(),
    };

    // adding the new message
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "1",
          message: input,
          modelUsed: selectedModel || "Model 1",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save message");
      }

      const data = await response.json();

      // Update the corresponding message with the AI response
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, response: data.response } : msg
        )
      );
    } catch (error) {
      //toast
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }

    setLoadingChat(false);
    setInput("");
  };

  // Handle toggling star status using userChatHistoryId
  const handleToggleStarMessage = async (
    userChatHistoryId: string,
    currentlyStarred: boolean
  ) => {
    try {
      const payload = { userId: "1", userChatHistoryId };

      const res = await fetch("/api/starred", {
        method: currentlyStarred ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to toggle star");
      }

      const starredRes = await fetch("/api/starred?userId=1");
      const starredResult = starredRes.ok
        ? await starredRes.json()
        : { response: [] };
      const starredData: StarredRecord[] = Array.isArray(starredResult.response)
        ? starredResult.response
        : [];

      setChatHistory((prev) =>
        prev.map((msg) => ({
          ...msg,
          starred: starredData.some(
            (starred) => starred.userChatHistoryId === msg.id
          ),
        }))
      );
    } catch (error) {
      //toast
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
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
        {loadingHistory ? (
          <Loader />
        ) : (
          chatHistory.map((entry) => (
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
          ))
        )}
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
            disabled={loadingChat}
            className="flex-grow"
          />
          {loadingChat ? (
            <LoaderMini />
          ) : (
            <Button type="submit" disabled={loadingChat || !input.length}>
              Send
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
