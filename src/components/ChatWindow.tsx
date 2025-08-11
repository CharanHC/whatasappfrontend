import { useEffect, useRef, useState } from "react";
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
  api: string; // The API URL is now passed as a prop
}

export default function ChatWindow({ waId, name, api }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Set your user ID here. Change this if your WhatsApp number is different.
  const myId = "929967673820";

  // Fetch messages and poll every 2 seconds
  useEffect(() => {
    if (!waId) return;

    const fetchMessages = () => {
      axios
        .get(`${api}/conversations/${waId}/messages`)
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Fetch messages error:", err));
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 2000);
    return () => clearInterval(intervalId);
  }, [waId, api]);

  // Auto-scroll on messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const deleteMessage = (id: string) => {
    if (id.startsWith("temp-")) {
      setMessages((prev) => prev.filter((m) => m._id !== id));
      return;
    }

    setMessages((prev) => prev.filter((m) => m._id !== id));

    axios
      .delete(`${api}/messages/${id}`)
      .catch((err) => {
        console.error("Delete error:", err);
      });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");

    try {
      await axios.post(`${api}/conversations/${waId}/messages`, {
        body: text,
      });
      // The next poll will retrieve the newly sent message.
      // We don't need to update the state optimistically.
      console.log("Message sent successfully");
    } catch (err) {
      console.error("Send message error:", err);
      // Optional: Add a visual indicator for send failure
    }
  };

  const renderTicks = (status: string) => {
    if (status === "read") return <span className="tick read">✓✓</span>;
    if (status === "delivered") return <span className="tick">✓✓</span>;
    if (status === "sent") return <span className="tick">✓</span>;
    if (status === "sending") return <span className="tick sending">…</span>;
    if (status === "failed") return <span className="tick failed">!</span>;
    return null;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="chat-header h-16">
        <div className="avatar">{(name || waId).charAt(0).toUpperCase()}</div>
        <div className="chat-info">
          <div className="chat-name">{name || waId}</div>
          <div className="chat-status">online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m) => {
          // Use the hardcoded myId to check if the message is from me
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
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          type="text"
        />
        <button onClick={sendMessage} type="button">
          Send
        </button>
      </div>
    </div>
  );
}
