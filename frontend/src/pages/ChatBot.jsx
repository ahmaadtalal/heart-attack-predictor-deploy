import React, { useState, useEffect, useRef } from "react";
import { chat } from "../api";
import bg from "../Assets/bg.jpg";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "../global.css";

export default function ChatBot({ userName, onLogout }) {
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [partialBotMsg, setPartialBotMsg] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => setAnimate(true), []);
  useEffect(
    () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [log, partialBotMsg]
  );

  const send = async () => {
    if (!msg) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to chat");

    setLog((prev) => [...prev, { user: msg, bot: null }]);
    const currentIndex = log.length;
    setMsg("");
    setPartialBotMsg("");

    try {
      const res = await chat(msg, token);

      let i = 0;
      const interval = setInterval(() => {
        i++;
        setPartialBotMsg(res.answer.slice(0, i));

        if (i >= res.answer.length) {
          clearInterval(interval);
          setLog((prev) => {
            const newLog = [...prev];
            newLog[currentIndex].bot = res.answer;
            return newLog;
          });
          setPartialBotMsg("");
        }
      }, 20);
    } catch (err) {
      setLog((prev) => {
        const newLog = [...prev];
        newLog[currentIndex].bot = "Error: " + err.message;
        return newLog;
      });
    }
  };

  const animatedStyle = (delay = 0) => ({
    opacity: animate ? 1 : 0,
    transform: animate ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.7s ease-out ${delay}s, transform 0.7s ease-out ${delay}s`,
  });

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 60px)", // subtract navbar height
        position: "relative",
        top: 0,
        left: 0,
        overflow: "hidden", // prevent page scroll
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(45%)",
          zIndex: -2,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.8))",
          zIndex: -1,
        }}
      />

      {/* Chat Container */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "min(800px, 90%)",
            height: "80%",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "18px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
            padding: "18px",
            ...animatedStyle(0.2),
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "10px",
              ...animatedStyle(0.3),
            }}
          >
            <h2
              style={{
                color: "white",
                fontWeight: "500",
                fontSize: "28px",
                margin: 0,
              }}
            >
              CardioBot
            </h2>
          </div>

          {/* Chat Log */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {log.map((l, i) => (
              <div key={i} style={{ width: "100%" }}>
                {/* User bubble */}
                <div
                  style={{
                    background: "#C86B84",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    maxWidth: "80%",
                    alignSelf: "flex-end",
                    marginLeft: "auto",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                    ...animatedStyle(0.1),
                  }}
                >
                  {l.user}
                </div>

                {/* Bot bubble */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    maxWidth: "80%",
                    minHeight: "40px",
                    alignSelf: "flex-start",
                    marginTop: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                    ...animatedStyle(0.15),
                  }}
                >
                  {l.bot ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {l.bot}
                    </ReactMarkdown>
                  ) : i === log.length - 1 ? (
                    partialBotMsg ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {partialBotMsg}
                      </ReactMarkdown>
                    ) : (
                      <span className="typing-dots">...</span>
                    )
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          {/* Input Area */}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Send a message..."
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                outline: "none",
                background: "rgba(255,255,255,0.25)",
                color: "white",
              }}
            />
            <button
              onClick={send}
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                border: "none",
                background: "#BE6B84",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
