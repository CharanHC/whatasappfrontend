import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./chatwindow.css";

interface Message {
  _id: string;
  from: string;
  body: string;
  timestamp: string;
  status: string;
}

interface ChatWindowProps {
  waId: string;
  name: string;
}

// The API URL from the main App.tsx file
const API = "https://whatsapp-fzn0.onrender.com";

export default function ChatWindow({ waId, name }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages and poll every 2 seconds
  useEffect(() => {
    if (!waId) return;

    const fetchMessages = () => {
      axios
        .get(`${API}/conversations/${waId}/messages`)
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Fetch messages error:", err));
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 2000);
    return () => clearInterval(intervalId);
  }, [waId]);

  // Auto-scroll on messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderTicks = (status: string) => {
    // You can use a more robust icon library, but these will work for now.
    if (status === "read") {
      return <span>✅✅</span>; // Blue double tick for read
    }
    if (status === "delivered") {
      return <span>✅✅</span>; // Gray double tick for delivered
    }
    if (status === "sent") {
      return <span>✅</span>; // Single tick for sent
    }
    return null;
  };

  const deleteMessage = (_id: string) => {
    axios
      .delete(`${API}/messages/${_id}`)
      .then(() => {
        // Optimistically remove the message from the UI
        setMessages((prevMessages) => prevMessages.filter((m) => m._id !== _id));
      })
      .catch((err) => console.error("Delete message error:", err));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Create a temporary message to instantly update the UI (Optimistic UI)
    const tempMessage = {
      _id: "temp-" + Date.now(), // Use a temporary ID
      from: "me",
      body: input,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    // Add the temporary message to the state
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setInput("");

    try {
      // Make the actual API call to send the message
      const res = await axios.post(`${API}/conversations/${waId}/messages`, {
        body: tempMessage.body,
      });

      // After a successful send, update the message in the state with the real data from the server
      const serverMessage = res.data.message;
      setMessages((prevMessages) =>
        prevMessages.map((m) =>
          m._id === tempMessage._id ? serverMessage : m
        )
      );
    } catch (err) {
      console.error("Send message error:", err);
      // If the send fails, remove the temporary message from the UI
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m._id !== tempMessage._id)
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#075e54] text-white p-4 font-bold text-lg h-16 flex items-center justify-between shadow-md">
        <span>{name}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isMe = m.from === "me";
          return (
            <div key={m._id} className={`chat-row ${isMe ? "right" : "left"}`}>
              <div className={`chat-bubble ${isMe ? "sent" : "received"}`}>
                <div className="chat-text">{m.body}</div>
                <div className="chat-meta">
                  <span className="time">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMe && renderTicks(m.status)}

                  {/* Delete Button */}
                  {isMe && (
                    <button
                      className="delete-btn"
                      onClick={() => deleteMessage(m._id)}
                      title="Delete message"
                      type="button"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input p-4 bg-gray-200">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          type="text"
          className="flex-1 rounded-full px-4 py-2 border-none focus:outline-none"
        />
        <button onClick={sendMessage} type="button" className="bg-[#128c7e] text-white rounded-full px-4 py-2 ml-2 font-semibold hover:bg-[#0c7667]">
          Send
        </button>
      </div>
    </div>
  );
}
