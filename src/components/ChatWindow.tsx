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

  // ✅ Fetch messages and poll every 2 seconds
  useEffect(() => {
    if (!waId) return;

    setMessages([]); // clear old chat messages to avoid scroll jump

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

  // ✅ Auto-scroll when messages change
 // useEffect(() => {
   // if (chatEndRef.current) {
     // chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    //}
  //}, [messages]);

  // ✅ Delete message
  const deleteMessage = (id: string) => {
    if (id.startsWith("temp-")) {
      setMessages((prev) => prev.filter((m) => m._id !== id));
      return;
    }

    setMessages((prev) => prev.filter((m) => m._id !== id));

    axios.delete(`${api}/messages/${id}`).catch((err) => {
      console.error("Delete error:", err);
    });
  };

  // ✅ Send message
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");

    try {
      await axios.post(`${api}/conversations/${waId}/messages`, {
        body: text,
      });
      console.log("Message sent successfully");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // ✅ Ticks rendering
  const renderTicks = (status: string) => {
    if (status === "read") return <span className="tick read">✓✓</span>;
    if (status === "delivered") return <span className="tick">✓✓</span>;
    if (status === "sent") return <span className="tick">✓</span>;
    if (status === "sending") return <span className="tick sending">…</span>;
    if (status === "failed") return <span className="tick failed">!</span>;
    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-200 rounded-r-2xl shadow-xl">
      {/* Header */}
      <div className="bg-[#075e54] text-white p-4 font-bold text-xl sticky top-0 z-10 h-16 flex items-center gap-4 shadow-lg">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
          {(name || waId).charAt(0).toUpperCase()}
        </div>
        <div className="chat-info">
          <div className="font-semibold text-lg">{name || waId}</div>
          <div className="text-sm opacity-80">online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((m) => {
          const isMe = m.from === "me"; // ✅ detect outgoing by "me"
          return (
            <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-3 rounded-xl max-w-lg shadow-sm ${
                  isMe
                    ? "bg-[#dcf8c6] text-black rounded-br-none"
                    : "bg-white text-black rounded-bl-none"
                }`}
              >
                <div className="text-sm break-words">{m.body}</div>
                <div className="flex items-center text-xs text-gray-500 mt-1 justify-end gap-1">
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
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
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
      <div className="p-4 bg-gray-100 border-t border-gray-300 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          type="text"
          className="flex-1 rounded-full border-2 border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
        />
        <button
          onClick={sendMessage}
          type="button"
          className="bg-green-500 text-white rounded-full p-3 shadow-md hover:bg-green-600 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
