import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../index.css";

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
  api: string;
}

export default function ChatWindow({ waId, name, api }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

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

  //useEffect(() => {
    //chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //}, [messages]);

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== id));
    axios.delete(`${api}/messages/${id}`).catch(console.error);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    try {
      await axios.post(`${api}/conversations/${waId}/messages`, { body: text });
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const renderTicks = (status: string) => {
    if (status === "read") return <span className="tick read">✓✓</span>;
    if (status === "delivered") return <span className="tick">✓✓</span>;
    if (status === "sent") return <span className="tick">✓</span>;
    return null;
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar">{(name || waId).charAt(0).toUpperCase()}</div>
        <div>
          <div className="header-name">{name || waId}</div>
          <div className="header-status">online</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((m) => {
          const isMe = m.from === "me";
          return (
            <div key={m._id} className={`message-row ${isMe ? "sent" : "received"}`}>
              <div className="message-bubble">
                <div>{m.body}</div>
                <div className="message-meta">
                  <span className="message-time">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMe && renderTicks(m.status)}
                  {isMe && (
                    <button onClick={() => deleteMessage(m._id)} className="delete-btn">🗑</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
