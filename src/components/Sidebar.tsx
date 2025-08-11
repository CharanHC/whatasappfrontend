import React from "react";
import type { Conversation } from "../types";

interface SidebarProps {
  conversations: Conversation[];
  selectedWaId: string;
  onSelect: (waId: string, name: string) => void;
}

export default function Sidebar({ conversations, selectedWaId, onSelect }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">WhatsApp Clone</div>
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
            <div className="avatar">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="chat-info">
              <div className="chat-top">
                <span className="chat-name">{name}</span>
                {conv.lastMessage?.timestamp && (
                  <span className="chat-time">
                    {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <div className="chat-last">{lastMsg}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
