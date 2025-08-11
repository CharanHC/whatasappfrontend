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

  // Set the user's ID to match the number in your screenshot
  const myId = "929967673820";

  // Helper function to render tick icons for message status
  const renderTicks = (status: string) => {
    switch (status) {
      case "sent":
        return <span className="tick-icon">✓</span>;
      case "delivered":
        return <span className="tick-icon">✓✓</span>;
      case "read":
        return <span className="tick-icon read">✓✓</span>;
      default:
        return null;
    }
  };

  // Delete a message
  const deleteMessage = (_id: string) => {
    axios
      .delete(`${API}/messages/${_id}`)
      .then(() => {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== _id)
        );
      })
      .catch((err) => console.error("Delete message error:", err));
  };

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

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageBody = input;
    setInput("");

    try {
      // Make the actual API call to send the message
      await axios.post(`${API}/conversations/${waId}/messages`, {
        body: messageBody,
      });

      // The message is successfully sent, the next poll will update the UI
      console.log("Message sent successfully");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#075e54] text-white p-4 font-bold text-lg sticky top-0 z-10 h-16 flex items-center">
        {name}
      </div>

      {/* Message window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          // Check if the message is from me using the hardcoded ID
          const isMe = m.from === myId;
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
      <div className="chat-input p-4 bg-white flex items-center gap-2 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={sendMessage}
          type="button"
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
}
