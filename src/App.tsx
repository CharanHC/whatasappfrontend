import  { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import type { Conversation } from "./types";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  // State for conversations, selected conversation ID, and name
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedWaId, setSelectedWaId] = useState("");
  const [selectedName, setSelectedName] = useState("");

  /**
   * Fetches conversations from the API.
   * After fetching, it automatically selects the first conversation
   * if none is currently selected.
   */
  const loadConversations = async () => {
    try {
      const res = await fetch(`${API}/conversations`);
      const data = await res.json();
      setConversations(data);
      
      // If there's no selected chat and we have conversations,
      // automatically select the first one.
      if (!selectedWaId && data.length > 0) {
        setSelectedWaId(data[0].wa_id);
        setSelectedName(data[0].lastMessage?.name || data[0].wa_id);
      }
    } catch (err) {
      console.error("Load conversations error:", err);
    }
  };

  // Effect to load conversations on component mount.
  useEffect(() => {
    loadConversations();
    // Optional: poll every 5s to keep conversations up-to-date
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
      <div className="flex-1">
        {selectedWaId ? (
          <ChatWindow waId={selectedWaId} name={selectedName} api={API} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
