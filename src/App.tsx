import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import type { Conversation } from "./types";


// The new API URL provided by you
const API = "https://whatsapp-fzn0.onrender.com";

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
    // Optional: poll every 5s
    // const id = setInterval(loadConversations, 5000);
    // return () => clearInterval(id);
  }, []);

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar
        conversations={conversations}
        selectedWaId={selectedWaId}
        onSelect={(waId, name) => {
          setSelectedWaId(waId);
          setSelectedName(name);
        }}
      />
      <div className="flex-1">
        {selectedWaId ? (
          <ChatWindow waId={selectedWaId} name={selectedName} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
