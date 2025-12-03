import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dashoreval from "../Assets/dashoreval.jpg";
import heartLogo1 from "../Assets/heartLogo1.png";

export default function UserSelection({ userName, isMedic }) {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => setAnimate(true), []);

  // Prevent horizontal scroll
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto";
    };
  }, []);

  useEffect(() => {
    document.title = "CardioCare | Selection";
    setAnimate(true);
  }, []);

  const animatedStyle = (delay = 0) => ({
    opacity: animate ? 1 : 0,
    transform: animate ? "translateY(0)" : "translateY(40px)",
    transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
  });

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
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
          backgroundImage: `url(${dashoreval})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(55%)",
          zIndex: -2,
        }}
      />

      {/* Dark Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          zIndex: -1,
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          padding: "40px 20px 20px 20px",
          textAlign: "center",
          color: "white",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo + Name */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            ...animatedStyle(0),
          }}
        >
          <img
            src={heartLogo1}
            alt="logo"
            style={{
              width: "55px",
              height: "55px",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))",
              animation: "heartbeat 2s infinite ease-in-out",
            }}
          />
          <h2
            style={{
              fontWeight: "600",
              letterSpacing: "1px",
              fontSize: "25px",
            }}
          >
            CardioCare
          </h2>
        </div>

        <h1
          style={{
            marginBottom: "20px",
            marginTop: "40px",
            fontSize: "30px",
            fontFamily: "geneo-sans, sans-serif",
            letterSpacing: "2px",
            ...animatedStyle(0.2),
          }}
        >
          Get Started!
        </h1>

        {/* Card Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 380px)",
            justifyContent: "center",
            gap: "30px",
            maxWidth: "800px",
            margin: "0 auto",
            fontSize: "14px",
            ...animatedStyle(0.4),
          }}
        >
          <Card
            title="Interactive Data Dashboard"
            desc="Visualize patterns, correlations, and predictions through interactive charts and summary panels."
            onClick={() => navigate("/dashboard")}
          />

          {!isMedic && (
            <Card
              title="Self Evaluation Form"
              desc="Input your medical details and instantly receive your personalized heart-risk score."
              onClick={() => navigate("/eval")}
            />
          )}

          <Card
            title="AI Health Chatbot"
            desc="Ask questions, understand results, and receive instant preventive heart-health insights."
            onClick={() => navigate("/chat")}
          />

          <Card
            title="Cardio Health Guide"
            desc="Explore heart-healthy routines, diet tips, and lifestyle changes recommended for long-term wellness."
            onClick={() => navigate("/health-guide")}
          />

          {isMedic && (
            <Card
              title="User Trend Analysis"
              desc="Analyze current app user trends, monitor activity patterns, and gain actionable insights."
              onClick={() => navigate("/medic-dashboard")}
            />
          )}
        </div>

        {/* Footer */}
        <footer
          style={{
            width: "100%",
            backgroundColor: "#4d092325",
            color: "white",
            padding: "5px 15px",
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "60px",
            fontSize: "12px",
            borderTop: "1px solid #4e1829e0",
            flexWrap: "wrap",
            textAlign: "center",
            backdropFilter: "blur(5px)",
            ...animatedStyle(0.7),
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "50px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h4 style={{ marginBottom: "6px" }}>Every 40 Seconds</h4>
              <p style={{ color: "#F4C9D4" }}>
                Someone suffers a heart attack somewhere around the world.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: "6px" }}>80% Preventable</h4>
              <p style={{ color: "#F4C9D4" }}>
                Most heart diseases can be prevented with early lifestyle
                changes.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: "6px" }}>#1 Global Killer</h4>
              <p style={{ color: "#F4C9D4" }}>
                Heart disease remains the world’s leading cause of death.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* CARD COMPONENT */
function Card({ title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#be6b84d6",
        padding: "30px",
        borderRadius: "14px",
        minHeight: "170px",
        cursor: "pointer",
        backdropFilter: "blur(4px)",
        transition:
          "transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease",
        boxShadow: "0 0 0 rgba(255, 100, 150, 0)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.background = "#64384A";
        e.currentTarget.style.boxShadow = "0 0 18px rgba(252, 93, 143, 0.34)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.background = "#be6b84d6";
        e.currentTarget.style.boxShadow = "#be6b84d6";
      }}
    >
      <h2 style={{ marginBottom: "12px", fontSize: "18px" }}>{title}</h2>
      <p style={{ fontSize: "14px", opacity: 0.9 }}>{desc}</p>
    </div>
  );
}
