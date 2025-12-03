import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import bg from "../Assets/bg.jpg";
import heartLogo1 from "../Assets/heartLogo1.png";

export default function Login({
  role,
  setIsLoggedIn,
  setIsMedic,
  setUserName,
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden"; // no scrollbars
  }, []);

  const animatedStyle = (delay = 0) => ({
    opacity: animate ? 1 : 0,
    transform: animate ? "translateY(0)" : "translateY(30px)",
    transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
  });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(form.email, form.password);

      if (role === "user" && res.is_medic) {
        setError("This is a Medic account, cannot login as User");
        return;
      }
      if (role === "medic" && !res.is_medic) {
        setError("This is a User account, cannot login as Medic");
        return;
      }

      localStorage.setItem("token", res.access_token);
      localStorage.setItem("is_medic", res.is_medic);
      localStorage.setItem("user_name", res.name);

      setIsLoggedIn(true);
      setIsMedic(res.is_medic);
      setUserName(res.name);

      if (role === "medic") {
        navigate("/userselection"); // Medic goes to selection page
      } else {
        navigate("/userselection"); // User goes to selection page
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        fontFamily: "sans-serif",
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
          filter: "brightness(50%)",
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
            "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.85))",
          zIndex: -1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: "white",
          width: "100%",
          maxWidth: "420px",
          padding: "20px",
        }}
      >
        <img
          src={heartLogo1}
          alt="Logo"
          style={{
            width: "120px",
            height: "120px",
            marginBottom: "20px",
            filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.6))",
            ...animatedStyle(0),
          }}
        />

        <h2
          style={{
            marginBottom: "25px",
            fontSize: "36px",
            fontWeight: "500",
            ...animatedStyle(0.2),
          }}
        >
          {role === "user" ? "User Login" : "Medic Login"}
        </h2>

        <form
          onSubmit={submit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.1)",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
            ...animatedStyle(0.4),
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={inputStyle}
          />
          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => hoverIn(e)}
            onMouseLeave={(e) => hoverOut(e)}
          >
            Login
          </button>
          {error && (
            <p style={{ color: "#ff6b6b", marginTop: "5px" }}>{error}</p>
          )}
        </form>

        <p style={{ marginTop: 15, color: "#F4C9D4", ...animatedStyle(0.6) }}>
          Don't have an account?{" "}
          <span
            style={{ color: "#BE6B84", cursor: "pointer", fontWeight: "500" }}
            onClick={() =>
              navigate(role === "user" ? "/user/register" : "/medic/register")
            }
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px 15px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  outline: "none",
  backgroundColor: "rgba(255,255,255,0.2)",
  color: "white",
  "::placeholder": { color: "#ddd" },
};

const buttonStyle = {
  padding: "12px",
  fontSize: "18px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#BE6B84",
  color: "white",
  fontWeight: "500",
  cursor: "pointer",
  transition: "transform 0.2s, background-color 0.2s",
};

/* Hover Animations */
const hoverIn = (e) => {
  e.currentTarget.style.transform = "scale(1.05)";
  e.currentTarget.style.backgroundColor = "#64384A";
};

const hoverOut = (e) => {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.backgroundColor = "#BE6B84";
};
