import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import type { Conversation } from "./types";
import "./index.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedWaId, setSelectedWaId] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");

  // 1) Only fetch & set conversations (no auto-select here)
  const loadConversations = async () => {
    try {
      const res = await fetch(`${API}/conversations`);
      const data = await res.json();
      setConversations(data || []);
    } catch (err) {
      console.error("Load conversations error:", err);
    }
  };

  // 2) Fetch on mount and poll every 5s
  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 5000);
    return () => clearInterval(id);
  }, []); // empty deps -> run once on mount

  // 3) Auto-select the first conversation ONLY when convs change and none is selected
  useEffect(() => {
    if (!selectedWaId && conversations.length > 0) {
      const first = conversations[0];
      setSelectedWaId(first.wa_id);
      setSelectedName(first.lastMessage?.name || first.wa_id);
    }
    // Only run when conversations OR selectedWaId change
  }, [conversations, selectedWaId]);

  // Optional: persist selection across reloads (uncomment if desired)
  // useEffect(() => {
  //   const saved = localStorage.getItem("selectedWaId");
  //   if (saved) setSelectedWaId(saved);
  // }, []);
  // useEffect(() => { if (selectedWaId) localStorage.setItem("selectedWaId", selectedWaId); }, [selectedWaId]);

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
