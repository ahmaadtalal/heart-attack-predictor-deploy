// --- CORRECTED BASE URL ---
// In a deployed environment, process.env.REACT_APP_API_URL holds the Render URL:
// https://heart-attack-predictor-deploy.onrender.com
// For local development, this defaults to undefined, so we set a fallback.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// --------------------
// Register
// --------------------
export async function register(data) {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Registration failed");
  }
  return res.json();
}

// --------------------
// Login / Token
// --------------------
export async function login(email, password) {
  // FastAPI expects form data for token endpoint
  const res = await fetch(`${API_BASE_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }
  return res.json();
}

// --------------------
// Get current user info (assuming this is needed by the frontend)
// --------------------
export async function me(token) {
  const res = await fetch(`${API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch user");
  }
  return res.json();
}

// --------------------
// Predict evaluation
// --------------------
export async function predict(evalData, token) {
  const res = await fetch(`${API_BASE_URL}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(evalData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Prediction failed");
  }

  const data = await res.json();

  // Return the processed prediction data
  return {
    result: {
      probability: data.risk,
      prediction:
        data.risk > 0.7
          ? "High risk"
          : data.risk > 0.4
          ? "Moderate risk"
          : "Low risk",
    },
    recommendations: [data.recommendation],
    id: data.id,
  };
}

// --------------------
// Dashboard
// --------------------
// NOTE: Dashboard.jsx uses axios directly for dashboard-analysis,
// but this function seems intended for fetching user-specific evaluations.
// Corrected to reflect this common pattern.
export async function dashboard(token) {
  const res = await await fetch(`${API_BASE_URL}/dashboard-analysis`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch dashboard data");
  }

  const data = await res.json();
  return data;
}

// --------------------
// Chat via Gemini
// --------------------
export async function chat(message, token) {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Chat failed");
  }

  const data = await res.json();

  return data;
}
