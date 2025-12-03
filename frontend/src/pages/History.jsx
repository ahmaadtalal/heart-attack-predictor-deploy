import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../api";
import historyBg from "../Assets/historyBg.jpg";
import BackToTopButton from "./BackToTopButton.tsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function History({ userName }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [history, setHistory] = useState([]);
  const [allUsersLatest, setAllUsersLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    async function fetchHistory() {
      try {
        const data = await getHistory(token);
        if (!data?.userHistory) {
          setHistory([]);
          setAllUsersLatest([]);
          return;
        }

        // parse and normalize dates, add dateLabel for tooltips
        const parsed = data.userHistory.map((item) => {
          const dateStr = item.date ?? item.created_at ?? item.createdAt;
          let parsedDate = new Date(dateStr.replace(" ", "T") + "Z"); // parse as UTC
          if (isNaN(parsedDate)) parsedDate = new Date(); // fallback
          const monthYear = parsedDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          });
          return {
            ...item,
            _parsedDateObj: parsedDate,
            xDay: parsedDate.getDate(),
            monthYear,
            dateLabel: parsedDate.toLocaleString(), // tooltip fix
            riskPct: +(item.risk * 100).toFixed(1),
          };
        });

        parsed.sort((a, b) => a._parsedDateObj - b._parsedDateObj);

        setHistory(parsed);
        setAllUsersLatest(data.allUsersLatest || []);
      } catch (err) {
        console.error("fetchHistory error:", err);
        setError(err.message || "Failed to fetch history");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [token, navigate]);

  // FIX: Add the missing state declaration here
  const [, setAnimate] = useState(false);

  // The original useEffect hook is now correctly referencing the setter
  useEffect(() => {
    document.title = "CardioCare | History";
    setAnimate(true);
  }, []);

  if (loading) return <p>Loading history...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!history.length) return <p>No evaluations found.</p>;

  const total = history.length;
  const latestEval = history[history.length - 1];
  const activePct = (
    (history.filter((h) => h.active).length / total) *
    100
  ).toFixed(1);
  const nonSmokerPct = (
    (history.filter((h) => !h.smoke).length / total) *
    100
  ).toFixed(1);

  // Pie chart data
  const lowRiskCount = history.filter((h) => h.riskPct < 20).length;
  const mediumRiskCount = history.filter(
    (h) => h.riskPct >= 20 && h.riskPct <= 50
  ).length;
  const highRiskCount = history.filter((h) => h.riskPct > 50).length;

  const pieData = [
    { name: "Low Risk (<20%)", value: lowRiskCount },
    { name: "Medium Risk (20–50%)", value: mediumRiskCount },
    { name: "High Risk (>50%)", value: highRiskCount },
  ];

  const pieColors = ["#4CAF50", "#FF9800", "#F44336"];

  let betterCholPct = 0;
  let betterBPPct = 0;

  if (allUsersLatest.length) {
    betterCholPct = (
      (allUsersLatest.filter((u) => latestEval.cholesterol < u.cholesterol)
        .length /
        allUsersLatest.length) *
      100
    ).toFixed(1);

    betterBPPct = (
      (allUsersLatest.filter(
        (u) =>
          (latestEval.ap_hi + latestEval.ap_lo) / 2 < (u.ap_hi + u.ap_lo) / 2
      ).length /
        allUsersLatest.length) *
      100
    ).toFixed(1);
  }

  const uniqueMonths = [...new Set(history.map((h) => h.monthYear))];
  const colorPalette = [
    "#f65656ff",
    "#3998f8ff",
    "#99FF99",
    "#FFCC99",
    "#CC99FF",
    "#FF99CC",
  ];
  const monthColors = {};
  uniqueMonths.forEach((m, idx) => {
    monthColors[m] = colorPalette[idx % colorPalette.length];
  });

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "sans-serif",
        color: "#fff",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.78), rgba(0,0,0,0.78)), url(${historyBg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>{userName}'s Evaluation History</h2>

      <BackToTopButton />

      {/* ----- Summary Section ----- */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          alignItems: "center",
        }}
      >
        {/* Left: Stats cards */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <div
            style={{
              padding: "15px",
              background: "#f48dbb95",
              borderRadius: "10px",
            }}
          >
            <strong>{activePct}%</strong> of time you are active
          </div>
          <div
            style={{
              padding: "15px",
              background: "#f48dbb95",
              borderRadius: "10px",
            }}
          >
            <strong>{nonSmokerPct}%</strong> of time you do not smoke
          </div>
          <div
            style={{
              padding: "15px",
              background: "#f48dbb95",
              borderRadius: "10px",
            }}
          >
            Better cholesterol than <strong>{betterCholPct}%</strong> of users
          </div>
          <div
            style={{
              padding: "15px",
              background: "#f48dbb95",
              borderRadius: "10px",
            }}
          >
            Better blood pressure than <strong>{betterBPPct}%</strong> of users
          </div>
        </div>

        {/* Right: Pie chart */}
        <div style={{ flex: 1, height: 350, marginLeft: "70px" }}>
          <h4
            style={{
              textAlign: "center",
              marginBottom: "10px",
              fontWeight: "600",
              fontSize: "18px",
            }}
          >
            Risk Level Distribution for You
          </h4>
          <PieChart width={700} height={350}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              labelLine={true}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(1)}%`
              }
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={pieColors[index % pieColors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </div>
      </div>

      {/* ----- Month headings ----- */}
      <div style={{ marginBottom: "20px" }}>
        {uniqueMonths.map((month) => (
          <span
            key={month}
            style={{
              color: monthColors[month],
              marginRight: "15px",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {month}
          </span>
        ))}
      </div>

      {/* Risk Over Time */}
      <h3>Risk Over Time (%)</h3>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={history}>
          <CartesianGrid stroke="#8181817e" strokeDasharray="3 3" />

          <XAxis
            dataKey="xDay"
            tick={({ x, y, payload, index }) => {
              const month = history[index]?.monthYear;
              const color = monthColors[month] || "#000";
              return (
                <text
                  x={x}
                  y={y + 15}
                  textAnchor="middle"
                  fill={color}
                  fontSize={12}
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[
              0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80,
              85, 90, 95, 100,
            ]}
            unit="%"
            tick={{ fill: "#fff" }}
          />
          <Tooltip
            formatter={(value, name) => [value, name]}
            labelFormatter={(label, idx) => history[idx]?.dateLabel || label}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="riskPct"
            name="Risk Percentage"
            stroke="#BE6B84"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Weight Over Time */}
      <h3 style={{ marginTop: "30px" }}>Weight Over Time (kg)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={history}>
          <CartesianGrid stroke="#43434371" strokeDasharray="3 3" />

          <XAxis
            dataKey="xDay"
            tick={({ x, y, payload, index }) => {
              const month = history[index]?.monthYear;
              const color = monthColors[month] || "#000";
              return (
                <text
                  x={x}
                  y={y + 15}
                  textAnchor="middle"
                  fill={color}
                  fontSize={12}
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <YAxis tickCount={21} tick={{ fill: "#fff" }} />
          <Tooltip
            formatter={(value, name) => [value, name]}
            labelFormatter={(label, idx) => history[idx]?.dateLabel || label}
          />
          <Bar dataKey="weight" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      {/* Cholesterol Over Time */}
      <h3 style={{ marginTop: "30px" }}>Cholesterol Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={history}>
          <CartesianGrid stroke="#43434371" strokeDasharray="3 3" />

          <XAxis
            dataKey="xDay"
            tick={({ x, y, payload, index }) => {
              const month = history[index]?.monthYear;
              const color = monthColors[month] || "#000";
              return (
                <text
                  x={x}
                  y={y + 15}
                  textAnchor="middle"
                  fill={color}
                  fontSize={12}
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <YAxis tick={{ fill: "#fff" }} />
          <Tooltip
            formatter={(value, name) => [value, name]}
            labelFormatter={(label, idx) => history[idx]?.dateLabel || label}
          />
          <Bar dataKey="cholesterol" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {/* Blood Pressure Over Time */}
      <h3 style={{ marginTop: "30px" }}>Blood Pressure Over Time</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={history}>
          <CartesianGrid stroke="#8181817e" strokeDasharray="3 3" />

          <XAxis
            dataKey="xDay"
            tick={({ x, y, payload, index }) => {
              const month = history[index]?.monthYear;
              const color = monthColors[month] || "#000";
              return (
                <text
                  x={x}
                  y={y + 15}
                  textAnchor="middle"
                  fill={color}
                  fontSize={12}
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <YAxis tick={{ fill: "#fff" }} />
          <Tooltip
            formatter={(value, name) => [value, name]}
            labelFormatter={(label, idx) => history[idx]?.dateLabel || label}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="ap_hi"
            stroke="#FF8042"
            name="Systolic"
          />
          <Line
            type="monotone"
            dataKey="ap_lo"
            stroke="#0088FE"
            name="Diastolic"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
