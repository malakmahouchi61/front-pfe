import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiCpu, FiSend, FiLoader, FiMessageSquare } from "react-icons/fi";
import "./DonorChat.css";

const DonorChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Bonjour cher donateur ! Posez-moi toutes vos questions sur les dons, les reçus fiscaux, ou l’impact de votre générosité.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "Veuillez vous connecter pour utiliser le chat.",
          },
        ]);
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "/api/chat/donor",
        { message: userMsg },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages((prev) => [...prev, { role: "bot", text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Désolé, une erreur est survenue. Réessayez plus tard.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-chat-container">
      <div className="chat-header">
        <div className="header-icon">
          <FiMessageSquare size={22} />
        </div>
        <div className="header-text">
          <h3>Assistant Donateur</h3>
          <p>Réponses instantanées sur vos dons, campagnes, et plus</p>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="bubble">
              {msg.role === "bot" && (
                <span className="bot-icon">
                  <FiCpu size={14} />
                </span>
              )}
              <span className="message-text">{msg.text}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="typing">
            <FiLoader className="spinner" size={14} />
            <span>L'assistant écrit...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre message... (ex: comment faire un don matériel ?)"
          rows="1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} disabled={loading}>
          <FiSend size={16} />
          <span>Envoyer</span>
        </button>
      </div>
    </div>
  );
};

export default DonorChat;