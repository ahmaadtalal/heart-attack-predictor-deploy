import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heartLogo1 from "../../Assets/heartLogo1.png";
import "./NavbarUser.css";



const NavbarUser = ({ isMedic, userName, onLogout, role }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // 

  const handleSwitchAccount = () => {
    localStorage.clear(); // clear current login
    if (role === "medic") {
      navigate("/medic/login"); // go to medic login
    } else {
      navigate("/user/login"); // go to user login
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <div className="navbar-logo">
          <img
            src={heartLogo1}
            alt="Cardiocare Logo"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "contain",
              filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.45))",
            }}
          />
          <span className="logo-text">Cardiocare</span>
          <span className="logo-pipe" />

          {/* NAVIGATION LINKS */}
          <div className="navbar-links">
            <Link to="/userselection" className="nav-link">
              Home
            </Link>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>

            {/* Show only for users */}
            {!isMedic && (
              <Link to="/eval" className="nav-link">
                Self Evaluation
              </Link>
            )}

            {/* HealthGuide visible for both users and medics */}
            <Link to="/health-guide" className="nav-link">
              Cardio Guide
            </Link>

            {/* ChatBot visible for both */}
            <Link to="/chat" className="nav-link">
              ChatBot
            </Link>

            {/* Medic Dashboard — only for medics */}
            {isMedic && (
              <Link to="/medic-dashboard" className="nav-link">
                User Trend Analysis
              </Link>
            )}

          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="navbar-actions">
          <div
            className="avatar-container"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              position: "relative",
            }}
          >
            {/* Avatar Circle */}
            <button
              className="user-avatar"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid var(--berry-accent)",
                backgroundColor: "var(--berry-dark)",
                color: "white",
                fontWeight: 500,
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </button>

            {/* Username */}
            <span
              style={{
                fontWeight: 350,
                color: "var(--berry-light)",
                fontSize: "16px",
              }}
            >
              Hello, {userName}
            </span>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="avatar-menu">

                {/* Username */}
                <p className="menu-user">{userName}</p>

                {/* Divider line */}
                <div className="menu-divider"></div>

                {/* View History — only for USERS */}
                {!isMedic && (
                  <>
                    <button
                      className="menu-item"
                      onClick={() => navigate("/history")}
                    >
                      View History
                    </button>

                    {/* Divider line */}
                    <div className="menu-user"></div>
                  </>
                )}

                {/* Switch Account */}
                <button className="menu-item" onClick={handleSwitchAccount}>
                  Switch Account
                </button>

                {/* Logout */}
                <button className="menu-item logout" onClick={onLogout}>
                  Logout
                </button>
              </div>
            )}


          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarUser;
