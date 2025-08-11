import type { Conversation } from "../types";

interface SidebarProps {
  conversations: Conversation[];
  selectedWaId: string;
  onSelect: (waId: string, name: string) => void;
}

export default function Sidebar({ conversations, selectedWaId, onSelect }: SidebarProps) {
  return (
    <div className="w-full md:w-1/3 border-r border-gray-300 bg-white overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="bg-[#075e54] text-white p-4 font-bold text-lg sticky top-0 z-10 h-16 flex items-center">
        WhatsApp
      </div>

      {/* Conversations */}
      {conversations.map((conv) => {
        const isSelected = selectedWaId === conv.wa_id;
        const name = conv.lastMessage?.name || conv.wa_id;
        const lastMsg = conv.lastMessage?.body || "";

        return (
          <div
            key={conv.wa_id}
            onClick={() => onSelect(conv.wa_id, name)}
            className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors
              ${isSelected ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
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
