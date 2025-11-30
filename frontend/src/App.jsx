// import React, { useState, useEffect } from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import Landing from "./pages/Landing";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import EvalForm from "./pages/EvalForm";
// import ChatBot from "./pages/ChatBot";
// import HealthGuide from "./pages/HealthGuide/HealthGuide";
// import UserSelection from "./pages/UserSelection";

// export default function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isMedic, setIsMedic] = useState(false);
//   const [userName, setUserName] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const medic = localStorage.getItem("is_medic");
//     const name = localStorage.getItem("user_name");
//     if (token) {
//       setIsLoggedIn(true);
//       setIsMedic(medic === "true");
//       setUserName(name);
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.clear();
//     setIsLoggedIn(false);
//     setIsMedic(false);
//     setUserName("");
//   };

//   return (
//     <BrowserRouter>
//       <div>
//         <Routes>
//           {/* Landing page */}
//           <Route path="/" element={<Landing />} />

//           {/* User routes */}
//           <Route
//             path="/user/login"
//             element={
//               <Login
//                 role="user"
//                 setIsLoggedIn={setIsLoggedIn}
//                 setIsMedic={setIsMedic}
//                 setUserName={setUserName}
//               />
//             }
//           />
//           <Route path="/user/register" element={<Register role="user" />} />

//           {/* UserSelection only for non-medic users */}
//           <Route
//             path="/userselection"
//             element={
//               isLoggedIn && !isMedic ? (
//                 <UserSelection userName={userName} onLogout={handleLogout} />
//               ) : (
//                 <Navigate to="/" />
//               )
//             }
//           />

//           <Route
//             path="/eval"
//             element={
//               isLoggedIn && !isMedic ? (
//                 <EvalForm userName={userName} onLogout={handleLogout} />
//               ) : (
//                 <Navigate to="/" />
//               )
//             }
//           />

//           {/* Medic routes */}
//           <Route
//             path="/medic/login"
//             element={
//               <Login
//                 role="medic"
//                 setIsLoggedIn={setIsLoggedIn}
//                 setIsMedic={setIsMedic}
//                 setUserName={setUserName}
//               />
//             }
//           />
//           <Route path="/medic/register" element={<Register role="medic" />} />

//           <Route
//             path="/dashboard"
//             element={
//               isLoggedIn ? (
//                 <Dashboard userName={userName} onLogout={handleLogout} />
//               ) : (
//                 <Navigate to="/" />
//               )
//             }
//           />

//           {/* Chat & HealthGuide */}
//           <Route
//             path="/chat"
//             element={
//               isLoggedIn ? (
//                 <ChatBot userName={userName} onLogout={handleLogout} />
//               ) : (
//                 <Navigate to="/" />
//               )
//             }
//           />
//           <Route
//             path="/health-guide"
//             element={
//               isLoggedIn ? (
//                 <HealthGuide userName={userName} onLogout={handleLogout} />
//               ) : (
//                 <Navigate to="/" />
//               )
//             }
//           />
//         </Routes>
//       </div>
//     </BrowserRouter>
//   );
// }

// Global Navbar
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import NavbarUser from "./pages/NavbarUser/NavbarUser";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EvalForm from "./pages/EvalForm";
import ChatBot from "./pages/ChatBot";
import HealthGuide from "./pages/HealthGuide/HealthGuide";
import UserSelection from "./pages/UserSelection";

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMedic, setIsMedic] = useState(false);
  const [userName, setUserName] = useState("");

  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const medic = localStorage.getItem("is_medic");
    const name = localStorage.getItem("user_name");
    if (token) {
      setIsLoggedIn(true);
      setIsMedic(medic === "true");
      setUserName(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsMedic(false);
    setUserName("");
  };

  // Hide navbar on Landing, Login, Register, and UserSelection pages
  const showNavbar =
    isLoggedIn &&
    location.pathname !== "/" &&
    !location.pathname.includes("/login") &&
    !location.pathname.includes("/register") &&
    location.pathname !== "/userselection";

  return (
    <>
      {/* Global Navbar */}
      {showNavbar && (
        <NavbarUser
          isMedic={isMedic}
          userName={userName}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* User Login & Register */}
        <Route
          path="/user/login"
          element={
            <Login
              role="user"
              setIsLoggedIn={setIsLoggedIn}
              setIsMedic={setIsMedic}
              setUserName={setUserName}
            />
          }
        />
        <Route path="/user/register" element={<Register role="user" />} />

        {/* Medic Login & Register */}
        <Route
          path="/medic/login"
          element={
            <Login
              role="medic"
              setIsLoggedIn={setIsLoggedIn}
              setIsMedic={setIsMedic}
              setUserName={setUserName}
            />
          }
        />
        <Route path="/medic/register" element={<Register role="medic" />} />

        {/* ---------------- User Only Routes ---------------- */}
        {!isMedic && (
          <>
            <Route
              path="/userselection"
              element={
                isLoggedIn ? (
                  <UserSelection userName={userName} /> // Navbar hidden
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/eval"
              element={
                isLoggedIn ? (
                  <EvalForm userName={userName} /> // Navbar visible
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </>
        )}

        {/* ---------------- Common Routes (User + Medic) ---------------- */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? <Dashboard userName={userName} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/chat"
          element={
            isLoggedIn ? <ChatBot userName={userName} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/health-guide"
          element={
            isLoggedIn ? (
              <HealthGuide userName={userName} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default AppWrapper;
