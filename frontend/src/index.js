import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // keep this if you have index.css
import "./global.css"; //

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
