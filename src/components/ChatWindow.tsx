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
      axios.get(`${api}/conversations/${waId}/messages`)
        .then(res => setMessages(res.data))
        .catch(err => console.error(err));
    };
    fetchMessages();
    const id = setInterval(fetchMessages, 2000);
    return () => clearInterval(id);
  }, [waId, api]);

  //useEffect(() => {
    //chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //}, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await axios.post(`${api}/conversations/${waId}/messages`, { body: text });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m._id !== id));
    axios.delete(`${api}/messages/${id}`).catch(console.error);
  };

  const renderTicks = (status: string) => {
    if (status === "read") return <span className="tick read">✓✓</span>;
    if (status === "delivered") return <span className="tick">✓✓</span>;
    if (status === "sent") return <span className="tick">✓</span>;
    return null;
  };

  return (
    <main className="chat-window">
      <div className="chat-header">
        <div className="chat-avatar">{(name || waId).charAt(0).toUpperCase()}</div>
        <div className="chat-header-meta">
          <div className="chat-name">{name || waId}</div>
          <div className="chat-status">online</div>
        </div>
      </div>

      {/* messages area is the only scrollable element on the right */}
      <div className="chat-messages">
        {messages.map(m => {
          const isMe = m.from === "me";
          return (
            <div key={m._id} className={`message-row ${isMe ? "msg-me" : "msg-them"}`}>
              <div className={`bubble ${isMe ? "bubble-me" : "bubble-them"}`}>
                <div className="bubble-text">{m.body}</div>
                <div className="bubble-meta">
                  <span className="time">{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {isMe && renderTicks(m.status)}
                  {isMe && <button className="delete-btn" onClick={() => deleteMessage(m._id)}>🗑</button>}
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
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="send-btn">✈</button>
      </div>
    </main>
  );
}
