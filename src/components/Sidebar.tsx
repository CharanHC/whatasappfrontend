
import type { Conversation } from "../types";

interface SidebarProps {
  conversations: Conversation[];
  selectedWaId: string;
  onSelect: (waId: string, name: string) => void;
}

export default function Sidebar({ conversations, selectedWaId, onSelect }: SidebarProps) {
  return (
    <div className="w-1/3 border-r bg-gray-100 overflow-y-auto">
      {/* Sticky header */}
      <div className="bg-[#075e54] text-white p-4 font-bold text-lg sticky top-0 z-10 h-16">
        WhatsApp Clone
      </div>

      {conversations.map((conv) => {
        const isSelected = selectedWaId === conv.wa_id;
        const name = conv.lastMessage?.name || conv.wa_id;
        const lastMsg = conv.lastMessage?.body || "";

        return (
          <div
            key={conv.wa_id}
            onClick={() => onSelect(conv.wa_id, name)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-200 ${
              isSelected ? "bg-gray-200" : ""
            }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold">
              {name.charAt(0).toUpperCase()}
            </div>

            {/* Chat info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <span className="font-semibold truncate">{name}</span>
                {conv.lastMessage?.timestamp && (
                  <span className="text-xs text-gray-500">
                    {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">{lastMsg}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
