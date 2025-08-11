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
      setConversations(data || []);
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
    // full viewport height, two columns
    <div className="app-root">
      <Sidebar
        conversations={conversations}
        selectedWaId={selectedWaId}
        onSelect={(waId, name) => {
          setSelectedWaId(waId);
          setSelectedName(name);
        }}
      />

      <div className="right-column">
        {selectedWaId ? (
          <ChatWindow waId={selectedWaId} name={selectedName} api={API} />
        ) : (
          <div className="empty-state">
            <p className="empty-text">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
