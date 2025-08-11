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
}

export default function ChatWindow({ waId, name, api }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const myId = "me";

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
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== id));
    axios.delete(`${api}/messages/${id}`).catch((err) => console.error(err));
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
    <div className="flex-1 flex flex-col bg-[#ece5dd] rounded-r-2xl shadow-xl">
      {/* Header */}
      <div className="bg-[#075e54] text-white px-4 font-bold text-lg sticky top-0 z-10 h-16 flex items-center gap-4 shadow-lg">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
          {(name || waId).charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold">{name || waId}</div>
          <div className="text-sm opacity-80">online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => {
          const isMe = m.from === myId;
          return (
            <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-3 rounded-xl max-w-lg shadow-sm ${
                  isMe ? "bg-[#dcf8c6] rounded-br-none" : "bg-white rounded-bl-none"
                }`}
              >
                <div className="text-sm break-words">{m.body}</div>
                <div className="flex items-center text-xs text-gray-500 mt-1 justify-end gap-1">
                  <span>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMe && renderTicks(m.status)}
                  {isMe && (
                    <button
                      className="text-xs text-gray-400 hover:text-red-500"
                      onClick={() => deleteMessage(m._id)}
                      title="Delete message"
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
      <div className="p-3 bg-gray-100 border-t border-gray-300 flex gap-2 sticky bottom-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center"
        >
          ✈
        </button>
      </div>
    </div>
  );
}
