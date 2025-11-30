const BASE_URL = "http://127.0.0.1:8000"; // Backend URL

// --------------------
// Register
// --------------------
export async function register(data) {
  const res = await fetch(`${BASE_URL}/register`, {
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
  const res = await fetch(`${BASE_URL}/token`, {
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
// Get current user info
// --------------------
export async function me(token) {
  const res = await fetch(`${BASE_URL}/me`, {
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
  const res = await fetch(`${BASE_URL}/evaluate`, {
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

  // Return exactly the fields EvalForm expects
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
export async function dashboard(token) {
  const res = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch dashboard data");
  }

  const data = await res.json();

  // For medic: return all users with their evaluations
  // For normal user: return only their evaluations
  // Ensure risk is included for chart
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (item.evaluations) {
          return item.evaluations.map((e) => ({
            id: e.id,
            risk: e.risk,
            created_at: e.created_at,
          }));
        } else {
          return {
            id: item.id,
            risk: item.risk,
            created_at: item.created_at,
          };
        }
      })
      .flat();
  }

  return data;
}

// --------------------
// Chat
// --------------------
// --------------------
// Chat via Gemini
// --------------------
export async function chat(message, token) {
  const res = await fetch(`${BASE_URL}/chat`, {
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

  // Gemini returns { answer: "..." }
  return data;
}
