import { useEffect, useState } from "react";
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

  const handleSelectChat = (waId: string, name: string) => {
    setSelectedWaId(waId);
    setSelectedName(name);
  };

  const handleBack = () => {
    setSelectedWaId("");
    setSelectedName("");
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Desktop view: show both sidebar + chat */}
      <div className="hidden md:flex w-full">
        <Sidebar
          conversations={conversations}
          selectedWaId={selectedWaId}
          onSelect={handleSelectChat}
        />
        <div className="flex-1">
          {selectedWaId ? (
            <ChatWindow waId={selectedWaId} name={selectedName} api={API} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-lg">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>

      {/* Mobile view: either sidebar OR chat */}
      <div className="flex md:hidden w-full">
        {!selectedWaId ? (
          <Sidebar
            conversations={conversations}
            selectedWaId={selectedWaId}
            onSelect={handleSelectChat}
          />
        ) : (
          <ChatWindow
            waId={selectedWaId}
            name={selectedName}
            api={API}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
