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
 // useEffect(() => {
   // chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //}, [messages]);

  // Delete message function with guard for temp messages
  const deleteMessage = (id: string) => {
    if (id.startsWith("temp-")) {
      // Just remove locally if it's a temp message (not saved to DB)
      setMessages((prev) => prev.filter((m) => m._id !== id));
      return;
    }

    // Optimistic remove from UI
    setMessages((prev) => prev.filter((m) => m._id !== id));

    axios
      .delete(`${api}/messages/${id}`)
      .catch((err) => {
        console.error("Delete error:", err);
        // Optionally, rollback UI removal if delete failed:
        // fetch latest messages again or re-add message locally
      });
  };

  // Send message with optimistic UI
  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      _id: tempId,
      from: "me",
      body: text,
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInput("");

    axios
      .post(`${api}/conversations/${waId}/messages`, {
        body: text,
      })
      .then((res) => {
        if (res.data?.ok && res.data?.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? res.data.message : m))
          );
        }
      })
      .catch(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId ? { ...m, status: "failed" } : m
          )
        );
      });
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
