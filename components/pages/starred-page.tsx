"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function StarredPage() {
  const [starredChats, setStarredChats] = useState<
    {
      id: string;
      userChatHistoryId: string;
      starredAt: string;
      modelUsed: string;
      userChatHistory?: {
        id: string;
        message: string;
        response: string;
      };
    }[]
  >([]);

  // Fetch starred messages and their associated chat history on page load
  useEffect(() => {
    const fetchStarredChats = async () => {
      try {
        const res = await fetch("/api/starred?userId=1"); // Replace with dynamic user ID
        if (!res.ok) throw new Error("Failed to fetch starred messages");
        const data = await res.json();
        // The API returns an object with a property "response"
        const starredData = data.response || [];
        console.log("Fetched starred messages:", starredData);
        setStarredChats(starredData);
      } catch (error) {
        console.error("Error fetching starred messages:", error);
      }
    };

    fetchStarredChats();
  }, []);

  // Handle un-starring a message
  const handleUnstar = async (userChatHistoryId: string) => {
    try {
      const res = await fetch("/api/starred", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "1", userChatHistoryId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to unstar message");
      }

      console.log("Message unstarred successfully");
      setStarredChats((prev) =>
        prev.filter((chat) => chat.userChatHistoryId !== userChatHistoryId)
      );
    } catch (error) {
      console.error("Error un-starring message:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-row items-center gap-5">
        <h1 className="font-bold text-2xl">Starred Messages</h1>
        <Link href="/">
          <button className="bg-blue-500 text-white p-2 rounded-md">
            Go Back
          </button>
        </Link>
      </div>

      {starredChats.length === 0 ? (
        <p className="mt-4 text-gray-500">No starred messages found.</p>
      ) : (
        <ul>
          {starredChats.map(
            ({ userChatHistoryId, starredAt, modelUsed, userChatHistory }) => (
              <li
                key={userChatHistoryId}
                className="p-4 border-b flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>Message:</strong>{" "}
                    {userChatHistory ? userChatHistory.message : "N/A"}
                  </p>
                  <p>
                    <strong>Response:</strong>{" "}
                    {userChatHistory ? userChatHistory.response : "N/A"}
                  </p>
                  <p>
                    <strong>Model Used:</strong> {modelUsed}
                  </p>
                  <p>
                    <strong>Starred At:</strong>{" "}
                    {new Date(starredAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleUnstar(userChatHistoryId)}
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                >
                  Unstar
                </button>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
