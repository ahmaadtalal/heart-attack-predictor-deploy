import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heartLogo1 from "../Assets/heartLogo1.png";
import bg from "../Assets/bg.jpg";

export default function Landing() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => setAnimate(true), []);

  const animatedStyle = (delay = 0) => ({
    opacity: animate ? 1 : 0,
    transform: animate ? "translateY(0)" : "translateY(40px)",
    transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
  });

  return (

    
    
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        padding: "40px 80px", // more left/right margin
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(50%)",
          zIndex: -2,
        }}
      />

      {/* Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.44), rgba(0,0,0,0.85))",
          zIndex: -1,
        }}
      />

      {/* PAGE CONTENT */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          color: "white",
        }}
      >
        {/* TOP SECTION: Logo + Heading + Hero Text */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flex: 1,
            gap: "60px",
          }}
        >
          {/* Left: Logo + Heading */}
<div style={{ display: "flex", alignItems: "flex-start", maxWidth: "55%" }}>
  <img
    src={heartLogo1}
    alt="logo"
    style={{
      width: "150px",
      height: "150px",
      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
      animation: "heartbeat 2s infinite ease-in-out",
      marginTop: "5px", // moved logo slightly up
      ...animatedStyle(0),
    }}
  />

  {/* Heading + hero text */}
  <div style={{ marginLeft: "50px", marginTop: "15px", flex:1 }}> {/* align heading with text below */}
    <h1
      style={{
        fontSize: "60px",
        fontWeight: "400",
        letterSpacing: "1px",
        marginLeft: "-45px",
        marginBottom: "28px", // spacing with the line below
        ...animatedStyle(0.2),
      }}
    >
      CARDIOCARE
    </h1>

    <p
      style={{
        fontSize: "20px",
        color: "#F4C9D4",
        marginTop: "-20px",
        maxWidth: "700px",

        lineHeight: "1.5",
        ...animatedStyle(0.3),
      }}
    >
      Your heart matters — Listen to it before it's too late.
    </p>

    <p
      style={{
        fontSize: "18px",
        color: "#d8b0be",
        marginTop: "8px",
        width: "110%",
        lineHeight: "2",
        ...animatedStyle(0.4),
      }}
    >

      {/* CardioCare helps you keep up with it, monitor potential risks, and make smarter choices for a longer, healthier life. */}
    </p>

    {/* Why CardioCare Section */}
    <div style={{ marginTop: "65px", ...animatedStyle(0.5) }}>
      <h3 style={{ fontSize: "22px", marginBottom: "8px" }}>Why CardioCare?</h3>
      <ul style={{ fontSize: "16px", lineHeight:2, color: "#F4C9D4", paddingLeft: "20px" }}>
        <li>Expert heart-health insights</li>
        <li>Personalized risk evaluations</li>
        <li>Smart dashboards for understanding your condition</li>
      </ul>
    </div>
  </div>
</div>


          {/* Right: Role Selection */}
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "30px",
              borderRadius: "14px",
              backdropFilter: "blur(4px)",
              maxWidth: "380px",
              textAlign: "center",
             marginRight: "80px",  // <-- ADD THIS LINE


              ...animatedStyle(0.6),
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>Get in Touch</h2>
            <p style={{ fontSize: "15px", color: "#F4C9D4", marginBottom: "25px" }}>
              {/* Choose how you want to access CardioCare */}
            </p>

            {/* USER */}
            <div style={{ marginBottom: "22px" }}>
              <button
                onClick={() => navigate("/user/login")}
                style={buttonStyles}
                onMouseEnter={hoverIn}
                onMouseLeave={hoverOut}
              >
                User
              </button>
              <p style={{ fontSize: "14px", marginTop: "8px", opacity: 0.9 }}>
                Track symptoms, view risk predictions & maintain your heart profile.
              </p>
            </div>

            {/* MEDIC */}
            <div>
              <button
                onClick={() => navigate("/medic/login")}
                style={buttonStyles}
                onMouseEnter={hoverIn}
                onMouseLeave={hoverOut}
              >
                Medic
              </button>
              <p style={{ fontSize: "14px", marginTop: "8px", opacity: 0.9 }}>
                Access patient dashboards & monitor their heart health insights.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER FACTS + PULSE LINE */}
        <div
          style={{
            textAlign: "center",
            marginTop: "auto",
            marginBottom: "10px",
            ...animatedStyle(0.7),
          }}
        >
          {/* Pulse Line */}
          <svg
            width="100%"
            height="40"
            viewBox="0 0 400 40"
            style={{ marginBottom: "10px" }}
          >
            <path
  d="M0 20 L80 20 L100 5 L120 35 L140 20 L200 20 L220 10 L240 30 L260 20 L400 20"
  stroke="#be6b84d1"
  strokeWidth="3"
  fill="none"
  strokeDasharray="500"
  strokeDashoffset="500"
>
  <animate
    attributeName="stroke-dashoffset"
    from="500"
    to="0"
    dur="2s"
    repeatCount="indefinite"
  />
</path>

          </svg>

          {/* Facts */}
          <div style={{ display: "flex", justifyContent: "center", gap: "50px", flexWrap: "wrap" }}>
            <div>
              <h4>100,000 Beats</h4>
              <p style={{ color: "#F4C9D4" }}>Your heart beats 100,000 times daily.</p>
            </div>
            <div>
              <h4>2,000 Gallons</h4>
              <p style={{ color: "#F4C9D4" }}>It pumps 2,000 gallons every day.</p>
            </div>
            <div>
              <h4>1 in 4 Deaths</h4>
              <p style={{ color: "#F4C9D4" }}>Heart disease accounts for 1 in 4 deaths globally.</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            textAlign: "center",
            fontSize: "13px",
            opacity: 0.8,
            marginTop: "8px",
          }}
        >
          {/* © 2025 CardioCare — Powered by Heart Intelligence */}
        </div>
      </div>

      <style>
{`
  @keyframes heartbeat {
    0% { transform: scale(1); filter: drop-shadow(0 0 6px #BE6B84); }
    25% { transform: scale(1.05); filter: drop-shadow(0 0 14px #BE6B84); }
    50% { transform: scale(1); filter: drop-shadow(0 0 6px #BE6B84); }
    100% { transform: scale(1); }
  }

  @media (max-width: 900px) {
    div[style*="display: flex"][style*="justify-content"] {
      flex-direction: column;
      align-items: center;
    }

    div[style*="maxWidth: '55%'"] {
      max-width: 100%;
      text-align: center;
      margin-left: 0 !important;
    }

    div[style*="maxWidth: '380px'"] {
      width: 90%;
      margin-top: 20px;
    }
  }
`}
</style>


    </div>
  );
}

/* Buttons (unchanged) */
const buttonStyles = {
  padding: "12px 28px",
  fontSize: "18px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#BE6B84",
  color: "white",
  transition: "transform 0.2s, background-color 0.2s",
};

const hoverIn = (e) => {
  e.currentTarget.style.transform = "scale(1.05)";
  e.currentTarget.style.backgroundColor = "#64384A";
};

const hoverOut = (e) => {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.backgroundColor = "#BE6B84";
};
