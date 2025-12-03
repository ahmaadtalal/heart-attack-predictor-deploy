import React, { useState, useEffect, useRef } from "react";
import { chat } from "../api";
import botbg from "../Assets/botbg.jpg";
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
  const [isGenerating, setIsGenerating] = useState(false);

  const chatEndRef = useRef(null);
  const streamRef = useRef(null); // <-- interval reference

  useEffect(() => setAnimate(true), []);

  useEffect(() => {
    document.title = "CardioCare | CardioBot";
    setAnimate(true);
  }, []);

  useEffect(
    () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [log, partialBotMsg]
  );

  const stopGeneration = () => {
    if (!isGenerating) return;

    clearInterval(streamRef.current); // stop the streaming
    streamRef.current = null;

    setLog((prev) => {
      const newLog = [...prev];
      const lastIndex = newLog.length - 1;

      // Save whatever was generated so far
      newLog[lastIndex].bot = partialBotMsg || "(stopped)";
      return newLog;
    });

    setPartialBotMsg("");
    setIsGenerating(false);
  };

  const send = async () => {
    if (!msg || isGenerating) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to chat");

    setIsGenerating(true);

    setLog((prev) => [...prev, { user: msg, bot: null }]);
    const currentIndex = log.length;
    setMsg("");
    setPartialBotMsg("");

    try {
      const res = await chat(msg, token);

      let i = 0;

      streamRef.current = setInterval(() => {
        i++;
        setPartialBotMsg(res.answer.slice(0, i));

        if (i >= res.answer.length) {
          clearInterval(streamRef.current);
          streamRef.current = null;

          setLog((prev) => {
            const newLog = [...prev];
            newLog[currentIndex].bot = res.answer;
            return newLog;
          });

          setPartialBotMsg("");
          setIsGenerating(false);
        }
      }, 20);
    } catch (err) {
      setLog((prev) => {
        const newLog = [...prev];
        newLog[currentIndex].bot = "Error: " + err.message;
        return newLog;
      });

      setIsGenerating(false);
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
        height: "calc(100vh - 80px)",
        position: "relative",
        overflow: "hidden",
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
          backgroundImage: `url(${botbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(45%)",
          zIndex: -2,
        }}
      />

      {/* Gradient */}
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

      {/* Chat Layout */}
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
                fontWeight: 500,
                fontSize: "28px",
                margin: 0,
              }}
            >
              CardioBot
            </h2>
          </div>

          {/* Chat messages */}
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
                {/* User */}
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

                {/* Bot */}
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

          {/* Input & Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Send a message..."
              disabled={isGenerating}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                outline: "none",
                background: "rgba(255,255,255,0.25)",
                color: "white",
                opacity: isGenerating ? 0.5 : 1,
              }}
            />

            {/* SEND / STOP BUTTON */}
            <button
              onClick={isGenerating ? stopGeneration : send}
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                border: "none",
                background: isGenerating ? "#B94B4B" : "#BE6B84",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
                width: "55px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isGenerating ? (
                // Stop Square Icon
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    background: "white",
                    borderRadius: "3px",
                    color: "#B94B4B",
                  }}
                ></div>
              ) : (
                "➤"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
