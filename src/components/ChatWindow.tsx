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
  api: string;
  onBack?: () => void; // for mobile
}

export default function ChatWindow({ waId, name, api, onBack }: ChatWindowProps) {
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div className="flex-1 flex flex-col bg-gray-200">
      {/* Header */}
      <div className="bg-[#075e54] text-white p-4 font-bold text-lg sticky top-0 z-10 h-16 flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden text-white text-xl font-bold"
          >
            ←
          </button>
        )}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
          {(name || waId).charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold">{name || waId}</div>
          <div className="text-sm text-green-200">online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => {
          const isMe = m.from === "me";
          return (
            <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-lg max-w-lg shadow-sm ${
                isMe ? "bg-[#dcf8c6]" : "bg-white"
              }`}>
                <div className="text-sm">{m.body}</div>
                <div className="flex items-center justify-end text-xs text-gray-500 mt-1 gap-1">
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMe && renderTicks(m.status)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-gray-100 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 text-white rounded-full px-4 py-2 hover:bg-green-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
