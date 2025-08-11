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

export default function ChatWindow({ waId, name }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const myId = "my_id_placeholder"; // Replace with the actual user ID.

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
      .delete(`${import.meta.env.VITE_API_URL}/messages/${_id}`)
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
        .get(`${import.meta.env.VITE_API_URL}/conversations/${waId}/messages`)
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

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      _id: Date.now().toString(), // Temporary ID
      from: myId,
      body: input,
      timestamp: new Date().toISOString(),
      status: "sending", // Temporary status
    };

    // Optimistically update the UI
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    axios
      .post(`${import.meta.env.VITE_API_URL}/conversations/${waId}/messages`, {
        body: newMessage.body,
      })
      .then(() => {
        // The message is successfully sent, the next poll will update the status
        console.log("Message sent successfully");
      })
      .catch((err) => {
        console.error("Send message error:", err);
        // If the message fails, revert the state
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== newMessage._id)
        );
      });
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
