"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Loader2, ShieldCheck, User } from "lucide-react";

export interface CompanyChatModalProps {
  driver: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyChatModal({ driver, isOpen, onClose }: CompanyChatModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    if (!driver?.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/company/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_chat_messages",
          data: { driverId: driver.id },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setMessages(json.messages || []);
      }
    } catch (err) {
      console.error("Load chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && driver?.id) {
      loadMessages();
    }
  }, [isOpen, driver?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen || !driver) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    const msgToSend = text.trim();
    setText("");

    try {
      const res = await fetch("/api/company/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_chat_message",
          data: { driverId: driver.id, message: msgToSend },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.message) {
          setMessages((prev) => [...prev, json.message]);
        }
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="commercial-modal-backdrop">
      <div
        className="commercial-modal-card"
        style={{ maxWidth: "600px", height: "600px", display: "flex", flexDirection: "column", padding: "1.5rem" }}
      >
        {/* Header Tchat */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem", borderBottom: "1px solid #1a2c44", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800" }}>
              {driver.first_name?.charAt(0) || "C"}
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ffffff" }}>
                {driver.first_name} {driver.last_name || ""}
              </h3>
              <div style={{ fontSize: "0.75rem", color: "#38bdf8", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <ShieldCheck size={12} />
                <span>Contact direct • {driver.city || "France"}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Zone de discussion */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", paddingRight: "0.5rem" }}>
          {loading && messages.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8", fontSize: "0.85rem" }}>
              <MessageSquare size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.4 }} />
              <p>Aucun message échangé pour l'instant.</p>
              <p style={{ marginTop: "0.25rem", color: "#64748b" }}>
                Initiez le dialogue pour lui présenter vos tournées ou convenir d'un appel téléphonique.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_type === "company";
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    padding: "0.75rem 1rem",
                    borderRadius: "14px",
                    background: isMe ? "#0284c7" : "#0d1b2e",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    lineHeight: "1.45",
                    border: isMe ? "none" : "1px solid #1a2c44",
                  }}
                >
                  <p>{m.message}</p>
                  <span style={{ display: "block", fontSize: "0.68rem", opacity: 0.75, textAlign: "right", marginTop: "0.25rem" }}>
                    {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <form onSubmit={handleSend} style={{ display: "flex", gap: "0.65rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #1a2c44" }}>
          <input
            type="text"
            placeholder="Écrivez votre message au conducteur..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ flex: 1, background: "#070d17", border: "1px solid #1c2e47", color: "#fff", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.88rem" }}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            style={{ background: "#0284c7", color: "#fff", border: "none", padding: "0.75rem 1.15rem", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "700" }}
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span>Envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
}
