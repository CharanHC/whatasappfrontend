import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import type { Conversation } from "./types";
import "./index.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedWaId, setSelectedWaId] = useState("");
  const [selectedName, setSelectedName] = useState("");

  const loadConversations = async () => {
    try {
      const res = await fetch(`${API}/conversations`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Load conversations error:", err);
    }
  };

  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        conversations={conversations}
        selectedWaId={selectedWaId}
        onSelect={(waId, name) => {
          setSelectedWaId(waId);
          setSelectedName(name);
        }}
      />
      <div className="chat-area">
        {selectedWaId ? (
          <ChatWindow waId={selectedWaId} name={selectedName} api={API} />
        ) : (
         <div className="flex-1 flex flex-col h-full">
  {selectedWaId ? (
    <ChatWindow waId={selectedWaId} name={selectedName} api={API} />
  ) : (
    <div className="flex-1 flex items-center justify-center bg-[#e5ddd5]">
      <p className="text-gray-500 text-3xl font-semibold text-center">
        Select a chat to start messaging
      </p>
    </div>
  )}
</div>

        )}
      </div>
    </div>
  );
}
