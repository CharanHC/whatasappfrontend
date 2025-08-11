import React from "react";
import type { Conversation } from "../types";

interface SidebarProps {
  conversations: Conversation[];
  selectedWaId: string;
  onSelect: (waId: string, name: string) => void;
}

export default function Sidebar({ conversations, selectedWaId, onSelect }: SidebarProps) {
  return (
    // full-height sidebar column
    <aside className="sidebar">
      {/* header stays fixed at top of sidebar */}
      <div className="sidebar-header">WhatsApp Clone</div>

      {/* this list scrolls independently inside sidebar */}
      <div className="sidebar-list">
        {conversations.map((conv) => {
          const isSelected = selectedWaId === conv.wa_id;
          const name = conv.lastMessage?.name || conv.wa_id;
          const lastMsg = conv.lastMessage?.body || "";

          return (
            <div
              key={conv.wa_id}
              onClick={() => onSelect(conv.wa_id, name)}
              className={`sidebar-item ${isSelected ? "selected" : ""}`}
            >
              <div className="avatar">{name.charAt(0).toUpperCase()}</div>
              <div className="meta">
                <div className="meta-top">
                  <div className="meta-name">{name}</div>
                  {conv.lastMessage?.timestamp && (
                    <div className="meta-time">
                      {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
                <div className="meta-last">{lastMsg}</div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
