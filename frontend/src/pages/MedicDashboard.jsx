import React, { useEffect, useState } from "react";
// import NavbarUser from "./NavbarUser/NavbarUser";
import historyBg from "../Assets/historyBg.jpg";
import { medicDashboard } from "../api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FF8042",
  "#FFBB28",
  "#AA336A",
  "#FF33AA",
  "#33FFAA",
];
// ...rest of imports remain the same

export default function MedicDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  // const userName = localStorage.getItem("user_name");
  const isMedic = localStorage.getItem("is_medic") === "true";

  // FIX: Add the missing state declaration here
  const [, setAnimate] = useState(false);

  // The original useEffect hook is now correctly referencing the setter
  useEffect(() => {
    document.title = "CardioCare | Analysis";
    setAnimate(true);
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchDashboard() {
      try {
        const data = await medicDashboard(token);
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to fetch dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  if (!isMedic) return <p>You do not have access to this page.</p>;
  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!dashboardData) return <p>No data available.</p>;

  // Prepare chart data
  const riskData = Object.entries(dashboardData.risk_percentages || {}).map(
    ([key, value]) => ({ name: key, value })
  );
  const genderData = Object.entries(dashboardData.gender_percentages || {}).map(
    ([key, value]) => ({ name: key, value })
  );
  const bpData = Object.entries(dashboardData.bp_percentages || {}).map(
    ([key, value]) => ({ name: key, value })
  );
  const cholData = Object.entries(
    dashboardData.cholesterol_percentages || {}
  ).map(([key, value]) => ({ name: `Level ${key}`, value }));

  const statCardStyle = {
    //background: "rgba(255, 255, 255, 0.75)",
    background: "#aa4b76f4",
    padding: "20px",
    flex: 1,
    color: "#ffff",

    textAlign: "center",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };
  const chartsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "30px",
    marginBottom: "30px",
  };
  const chartStyle = {
    flex: 1,
    minWidth: "350px",
    background: "rgba(255, 255, 255, 0.86)",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0,0,0,0.7)), url(${historyBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h2 style={{ color: "#ffffffff", marginBottom: "20px" }}>
        Active Users trend
      </h2>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={statCardStyle}>
          <h4>Total Users</h4>
          <p>{dashboardData.total_users}</p>
        </div>
        <div style={statCardStyle}>
          <h4>High-Risk %</h4>
          <p>{dashboardData.high_risk_percentage?.toFixed(1)}%</p>
        </div>
        <div style={statCardStyle}>
          <h4>Smoking %</h4>
          <p>{dashboardData.smoking_percentage?.toFixed(1)}%</p>
        </div>
        <div style={statCardStyle}>
          <h4>Physically Active %</h4>
          <p>{dashboardData.active_percentage?.toFixed(1)}%</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div style={chartsContainerStyle}>
        <div style={chartStyle}>
          <h4>Risk Distribution %</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {riskData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={chartStyle}>
          <h4>Gender Distribution %</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {genderData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Charts */}
      <div style={chartsContainerStyle}>
        <div style={chartStyle}>
          <h4>Blood Pressure Categories</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bpData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={chartStyle}>
          <h4>Cholesterol Levels</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cholData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latest Evaluations Table */}
      <h3 style={{ color: "#fff", marginBottom: "10px" }}>
        Latest Evaluations
      </h3>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "rgba(255,255,255,0.9)",
            borderRadius: "8px",
            overflow: "hidden",
            tableLayout: "fixed", // ensures equal column widths
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: "10px", textAlign: "center" }}>User</th>
              <th style={{ padding: "10px", textAlign: "center" }}>
                Age (Years)
              </th>
              <th style={{ padding: "10px", textAlign: "center" }}>Gender</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Weight</th>
              <th style={{ padding: "10px", textAlign: "center" }}>
                Cholesterol
              </th>
              <th style={{ padding: "10px", textAlign: "center" }}>BP (S/D)</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Smoking</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Active</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Risk</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.latest_evals.map((e) => (
              <tr key={e.id}>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  Anonymous
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {Math.floor(e.age / 365)}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {e.gender === 1 ? "Male" : "Female"}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {e.weight}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {e.cholesterol}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {e.ap_hi}/{e.ap_lo}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {e.smoke ? "Yes" : "No"}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {e.active ? "Yes" : "No"}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {(e.risk * 100).toFixed(1)}%
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  {e.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
