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

      // Auto-select first chat if none selected
      if (data.length > 0 && !selectedWaId) {
        setSelectedWaId(data[0].wa_id);
        setSelectedName(data[0].lastMessage?.name || data[0].wa_id);
      }
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
    <div className="h-screen flex bg-gray-100">
      <Sidebar
        conversations={conversations}
        selectedWaId={selectedWaId}
        onSelect={(waId, name) => {
          setSelectedWaId(waId);
          setSelectedName(name);
        }}
      />
      <div className="flex-1 flex flex-col">
        {selectedWaId ? (
          <ChatWindow waId={selectedWaId} name={selectedName} api={API} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-lg p-4 text-center">
            <span className="bg-gray-200 p-4 rounded-lg shadow-sm">
              Select a chat to start messaging
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
