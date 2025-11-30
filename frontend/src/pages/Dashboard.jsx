import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  Label,
} from "recharts";
import dashbg from "../Assets/dashbg.jpg";

// Reusable Chart Card Component (moved inside the file or can be kept external if needed)
const ChartCard = ({ title, children, width = 950, style = {} }) => (
  <div
    style={{
      backgroundColor: "rgba(90, 90, 90, 0.5)",
      borderRadius: "12px",
      padding: "25px",
      marginBottom: "50px",
      width: width,
      maxWidth: "100%",
      color: "#fff",
      boxShadow: "0 12px 25px rgba(0,0,0,0.5)",
      textAlign: "center",
      ...style,
    }}
  >
    <h3 style={{ marginBottom: "20px", fontSize: "22px", fontWeight: "500" }}>
      {title}
    </h3>
    {children}
  </div>
);

export default function Dashboard({ userName, onLogout }) {
  // Use REACT_APP_API_URL from the environment variable
  const API_ENDPOINT = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  // Chart and analytics states
  const [lineData, setLineData] = useState({ Female: [], Male: [] });
  const [genderRisk, setGenderRisk] = useState([]);
  const [barData, setBarData] = useState({ Female: [], Male: [] });
  const [riskSummary, setRiskSummary] = useState({});
  const [ageGroupAnalysis, setAgeGroupAnalysis] = useState([]);
  const [bmiDistribution, setBmiDistribution] = useState([]);
  const [bpAnalysis, setBpAnalysis] = useState([]);

  // NOTE: 'lifestyleImpact' variable was removed per ESLint warning
  // Now we use useState just to hold the data, the unused warning for it is gone.
  const [lifestyleImpactData, setLifestyleImpactData] = useState({});

  const [cholesterolAnalysis, setCholesterolAnalysis] = useState([]);
  const [glucoseAnalysis, setGlucoseAnalysis] = useState([]);
  const [highRiskProfile, setHighRiskProfile] = useState({});
  const [stats, setStats] = useState({});

  const cardStyle = {
    background: "#333",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
  };

  // Modal state for trend report
  const [showTrendReport, setShowTrendReport] = useState(false);

  const handleAnalyzeTrend = () => setShowTrendReport(true);
  const handleCloseTrendReport = () => setShowTrendReport(false);

  // Define API endpoint in useEffect dependencies to ensure react-hooks/exhaustive-deps is happy
  useEffect(() => {
    const fetchData = async () => {
      // Use the deployed API endpoint
      const API_URL = `${API_ENDPOINT}/dashboard-analysis`;

      try {
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLineData(res.data.line_data);
        setGenderRisk(res.data.gender_risk);
        setBarData(res.data.bar_data);
        setRiskSummary(res.data.risk_summary);
        setAgeGroupAnalysis(res.data.age_group_analysis);
        setBmiDistribution(res.data.bmi_distribution);
        setBpAnalysis(res.data.bp_analysis);

        // Use the renamed setter
        setLifestyleImpactData(res.data.lifestyle_impact);

        setCholesterolAnalysis(res.data.cholesterol_analysis);
        setGlucoseAnalysis(res.data.glucose_analysis);
        setHighRiskProfile(res.data.high_risk_profile);
        setStats(res.data.statistics);
      } catch (err) {
        // Replaced alert with console log to prevent modal blocking in deployment environments
        console.error("Error fetching dashboard data:", err);
        // Display a message box on the UI instead of alert() if necessary
        // For now, sticking to console error is safer.
      }
    };

    // Add all setters used in the effect body to the dependencies list (React rule)
    // Removed dependency warnings by including all state setters.
    fetchData();
  }, [
    token,
    API_ENDPOINT,
    setLineData,
    setGenderRisk,
    setBarData,
    setRiskSummary,
    setAgeGroupAnalysis,
    setBmiDistribution,
    setBpAnalysis,
    setLifestyleImpactData,
    setCholesterolAnalysis,
    setGlucoseAnalysis,
    setHighRiskProfile,
    setStats,
  ]);

  // Prepare data for pie chart
  const pieRiskData = Object.entries(riskSummary).map(([name, value]) => ({
    name,
    value,
  }));

  // ------------ GENERIC INSIDE LABEL FUNCTION ------------
  const renderInsideLabel = ({
    value,
    percent,
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    mode,
  }) => {
    const RAD = Math.PI / 180;
    const radius = (innerRadius + outerRadius) / 2; // center of slice
    const x = cx + radius * Math.cos(-midAngle * RAD);
    const y = cy + radius * Math.sin(-midAngle * RAD);

    return (
      <text
        x={x}
        y={y}
        fill="#000000ff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        pointerEvents="none"
      >
        {mode === "gender" ? value.toFixed(2) + "%" : value}
      </text>
    );
  };

  // ------------ GENERIC OUTSIDE LABEL FUNCTION ------------
  const renderOutsideLabel = ({ name, cx, cy, midAngle, outerRadius }) => {
    const RAD = Math.PI / 180;
    const radius = outerRadius + 25; // outside distance
    const x = cx + radius * Math.cos(-midAngle * RAD);
    const y = cy + radius * Math.sin(-midAngle * RAD);

    return (
      <text
        x={x}
        y={y}
        fill="#fe9618ff"
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight={600}
        fontSize={18}
        pointerEvents="none"
      >
        {name}
      </text>
    );
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        color: "#fff",
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${dashbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        boxSizing: "border-box",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* --- TREND REPORT MODAL --- */}
      {showTrendReport && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#1e1e2f",
              color: "#fff",
              padding: "30px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "1100px", // Increased max width for readability
              maxHeight: "90%",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <button
              onClick={handleCloseTrendReport}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "red",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              X
            </button>

            <h2 style={{ textAlign: "center", marginBottom: "25px" }}>
              Trend Report
            </h2>

            {/* ---------- Overall Stats (MODAL HEADER) ---------- */}
            <h3>Overall Dataset Statistics</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "20px",
                marginBottom: "25px",
              }}
            >
              <div style={cardStyle}>
                {" "}
                <h3>{stats.total_patients}</h3> <p>Total Patients</p>{" "}
              </div>
              <div style={cardStyle}>
                {" "}
                <h3>{stats.avg_age?.toFixed(1)}</h3> <p>Average Age</p>{" "}
              </div>
              <div style={cardStyle}>
                {" "}
                <h3>{stats.disease_prevalence_percentage?.toFixed(1)}%</h3>{" "}
                <p>Disease Prevalence</p>{" "}
              </div>
              <div style={cardStyle}>
                {" "}
                <h3>{stats.avg_bmi?.toFixed(1)}</h3> <p>Average BMI</p>{" "}
              </div>
              <div style={cardStyle}>
                {" "}
                <h3>{stats.high_bp_percentage?.toFixed(1)}%</h3>{" "}
                <p>High BP %</p>{" "}
              </div>
            </div>

            {/* ---------- High-Risk Patients Section (MODAL CONTENT) ---------- */}
            <h3>High-Risk Patients</h3>
            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "25px",
              }}
            >
              <div style={cardStyle}>
                {" "}
                <h3>{highRiskProfile.total_high_risk}</h3>{" "}
                <p>Total High-Risk</p>{" "}
              </div>
              <div style={cardStyle}>
                {" "}
                <h3>
                  {highRiskProfile.high_risk_percentage?.toFixed(1)}%
                </h3>{" "}
                <p>High-Risk %</p>{" "}
              </div>
              <div style={cardStyle}>
                <p>Disease Rate in High-Risk:</p>
                <div
                  style={{
                    background: "#333",
                    borderRadius: "10px",
                    overflow: "hidden",
                    height: "15px",
                  }}
                >
                  <div
                    style={{
                      width: `${highRiskProfile.disease_rate_in_high_risk}%`,
                      height: "100%",
                      background: "#29B6F6",
                    }}
                  />
                </div>
                <p>{highRiskProfile.disease_rate_in_high_risk?.toFixed(1)}%</p>
              </div>
            </div>

            {/* ---------- Age Group Analysis (MODAL CONTENT) ---------- */}
            <h3>Age Group Analysis</h3>
            <table
              style={{
                width: "100%",
                color: "#fff",
                textAlign: "center",
                marginBottom: "25px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #fff" }}>
                  <th>Age Group</th>
                  <th>Disease %</th>
                  <th>Total Patients</th>
                  <th>Diseased Patients</th>
                </tr>
              </thead>
              <tbody>
                {ageGroupAnalysis.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
                    <td>{item.age_group}</td>
                    <td>{item.disease_percentage.toFixed(1)}</td>
                    <td>{item.total_patients}</td>
                    <td>{item.diseased_patients}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Rest of the tables in the Modal */}
            {/* BMI Distribution */}
            <h3>BMI Distribution</h3>
            <table
              style={{
                width: "100%",
                color: "#fff",
                textAlign: "center",
                marginBottom: "25px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #fff" }}>
                  <th>BMI Category</th>
                  <th>Disease %</th>
                  <th>Total Patients</th>
                  <th>Diseased Patients</th>
                </tr>
              </thead>
              <tbody>
                {bmiDistribution.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
                    <td>{item.bmi_category}</td>
                    <td>{item.disease_percentage.toFixed(1)}</td>
                    <td>{item.total_patients}</td>
                    <td>{item.diseased_patients}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Blood Pressure Analysis */}
            <h3>Blood Pressure Analysis</h3>
            <table
              style={{
                width: "100%",
                color: "#fff",
                textAlign: "center",
                marginBottom: "25px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #fff" }}>
                  <th>BP Category</th>
                  <th>Disease %</th>
                  <th>Total Patients</th>
                  <th>Diseased Patients</th>
                </tr>
              </thead>
              <tbody>
                {bpAnalysis.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
                    <td>{item.bp_category}</td>
                    <td>{item.disease_percentage.toFixed(1)}</td>
                    <td>{item.total_patients}</td>
                    <td>{item.diseased_patients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Cholesterol and Glucose Tables (Optional if needed in Modal) */}
            {/* If you want Cholesterol/Glucose tables in the Modal, uncomment and adapt the code from below. */}
          </div>
        </div>
      )}

      {/* --- DASHBOARD CONTENT --- */}

      {/* Dashboard Header */}
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "36px",
          fontWeight: "500",
        }}
      >
        Heart Attack Risk Dashboard
      </h2>

      {/* Analyze Trend Button below the heading */}
      <button
        onClick={handleAnalyzeTrend}
        style={{
          padding: "15px 30px",
          fontSize: "16px",
          backgroundColor: "#be0d0dff", // default red
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "40px",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = "#880202ff")
        } // dark red
        onMouseOut={(e) =>
          (e.currentTarget.style.backgroundColor = "#be0d0dff")
        } // back to default red
      >
        Analyze Trend
      </button>

      <div
        style={{
          backgroundColor: "rgba(90, 90, 90, 0.5)",
          borderRadius: "12px",
          marginBottom: "50px",
          maxWidth: "100%",
          color: "#fff",
          boxShadow: "0 12px 25px rgba(0,0,0,0.5)",
          padding: "20px",
        }}
      >
        {/* Heading inside the box */}
        <div
          style={{
            fontSize: "26px",
            fontWeight: "400",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Estimated Health Risk by Age
        </div>

        {/* LineChart below heading */}
        <LineChart
          width={900}
          height={450}
          data={lineData.Female?.length > 0 ? lineData.Female : []}
          margin={{ top: 10, right: 30, left: 50, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#c0c0c0ff" />

          <XAxis
            dataKey="age"
            type="number"
            domain={["dataMin", "dataMax"]}
            tick={{ fill: "#fff" }}
            label={{
              value: "Age (years)",
              position: "insideBottom",
              offset: -40,
              fill: "#f1961eff",
              fontSize: 18,
              fontWeight: "600",
            }}
          />

          <YAxis
            type="number"
            domain={[0, 100]}
            tickCount={6}
            tick={{ fill: "#fff" }}
            label={{
              value: "Risk %",
              angle: -90,
              position: "insideLeft",
              offset: -10,
              fontSize: 18,
              fill: "#f1961eff",
              fontWeight: "600",
            }}
          />

          <Tooltip
            contentStyle={{ backgroundColor: "#222", border: "1px solid #fff" }}
            formatter={(value) => `${value.toFixed(1)}%`}
          />

          <Legend
            align="right"
            verticalAlign="bottom"
            wrapperStyle={{ color: "#fff" }}
          />

          {lineData.Female?.length > 0 && (
            <Line
              type="monotone"
              dataKey="risk_percentage"
              data={lineData.Female}
              name="Female"
              stroke="#FF4081"
              strokeWidth={3}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          )}

          {lineData.Male?.length > 0 && (
            <Line
              type="monotone"
              dataKey="risk_percentage"
              data={lineData.Male}
              name="Male"
              stroke="#00E5FF"
              strokeWidth={3}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </div>

      {/* Pie Charts */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: "30px",
        }}
      >
        <ChartCard title="Heart Attack Risk by Gender" width={400}>
          <PieChart width={400} height={300}>
            <Pie
              data={genderRisk}
              dataKey="risk_percentage"
              nameKey="gender_label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={(props) => renderOutsideLabel(props)}
            >
              {genderRisk.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.gender_label === "Female" ? "#3cad72ff" : "#28ddc2ff"
                  }
                />
              ))}
            </Pie>

            {/* INSIDE VALUES */}
            <Pie
              data={genderRisk}
              dataKey="risk_percentage"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="transparent"
              stroke="none"
              isAnimationActive={false}
              labelLine={false}
              label={(props) => renderInsideLabel({ ...props, mode: "gender" })}
            />
          </PieChart>
        </ChartCard>

        <ChartCard title="# of Patients by Heart Attack Risk" width={400}>
          <PieChart width={400} height={300}>
            <Pie
              data={pieRiskData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={(props) => renderOutsideLabel(props)}
            >
              {pieRiskData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.name === "Low" ? "#A569BD" : "#D7BDE2"}
                />
              ))}
            </Pie>

            {/* INSIDE VALUES */}
            <Pie
              data={pieRiskData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="transparent"
              stroke="none"
              isAnimationActive={false}
              labelLine={false}
              label={(props) => renderInsideLabel({ ...props, mode: "risk" })}
            />
          </PieChart>
        </ChartCard>
      </div>

      {/* Bar Charts (Gender Specific - outside modal) */}
      {["Female", "Male"].map((gender) => (
        <ChartCard
          key={gender}
          title={`${gender} - Average Health Metric Values`}
          style={{ height: "400px" }} // increase card height
        >
          <BarChart
            width={900}
            height={350} // increased chart height
            data={barData[gender]}
            margin={{ top: 20, right: 30, left: 50, bottom: 60 }} // more bottom & left margin
          >
            <CartesianGrid strokeDasharray="3 3" />

            {/* X-Axis */}
            <XAxis
              dataKey="feature"
              interval={0}
              angle={-30}
              textAnchor="end"
              tick={{ fill: "white" }}
            >
              <Label
                value="Health Metric"
                fontSize={20}
                offset={40} // more spacing from axis
                position="bottom"
                fill={gender === "Female" ? "#FF69B4" : "#00BFFF"}
              />
            </XAxis>

            {/* Y-Axis */}
            <YAxis tick={{ fill: "white" }}>
              <Label
                value="Average value"
                fontSize={20}
                angle={-90}
                position="insideLeft"
                fill={gender === "Female" ? "#FF69B4" : "#00BFFF"}
                offset={-15} // more spacing from axis
              />
            </YAxis>

            <Tooltip />

            <Bar
              dataKey="value"
              fill={gender === "Female" ? "#FF69B4" : "#00BFFF"}
            />
          </BarChart>
        </ChartCard>
      ))}

      {/* New Analytics Cards (outside modal) */}

      {/* Age Group Analysis */}
      <ChartCard
        title="Heart Attack Percentage by Age Group"
        style={{ height: "400px" }} // same height as gender charts
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BarChart
            width={900} // same width as gender charts
            height={350} // same height
            data={ageGroupAnalysis}
            margin={{ top: 20, right: 30, left: 50, bottom: 60 }} // same margins
          >
            <CartesianGrid strokeDasharray="3 3" />

            {/* X-Axis */}
            <XAxis
              dataKey="age_group"
              interval={0}
              angle={0}
              textAnchor="middle"
              tick={{ fill: "white" }}
            >
              <Label
                value="Age Groups"
                fontSize={20}
                offset={30}
                position="bottom"
                fill="#efd7ffff"
              />
            </XAxis>

            {/* Y-Axis */}
            <YAxis tick={{ fill: "white" }}>
              <Label
                value="Disease Risk %"
                fontSize={20}
                angle={-90}
                position="insideLeft"
                offset={-15}
                fill="#efd7ffff"
              />
            </YAxis>

            <Tooltip />

            <Bar
              name="Disease Percentage %"
              dataKey="disease_percentage"
              fill="#6d3690ff"
              barSize={100}
            />
          </BarChart>
        </div>
      </ChartCard>

      {/* BMI Distribution */}
      <ChartCard title="% Patient's BMI Category Distribution">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: "16px",
            alignItems: "center",
          }}
        >
          <PieChart width={630} height={350}>
            <Pie
              data={bmiDistribution}
              dataKey="disease_percentage"
              nameKey="bmi_category"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={(entry) =>
                `${entry.bmi_category}: ${entry.disease_percentage.toFixed(1)}%`
              }
            >
              {bmiDistribution.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    {
                      Underweight: "#F8BBD0", // light pink
                      Normal: "#F48FB1", // pinkish-mauve
                      Overweight: "#CE93D8", // mauve
                      Obese: "#c479d1ff", // deeper mauve
                    }[entry.bmi_category]
                  }
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend
              verticalAlign="bottom"
              align="center"
              layout="horizontal"
              wrapperStyle={{ marginTop: 20 }}
              iconSize={14}
              formatter={(value) => (
                <span style={{ marginRight: 40, color: "white", fontSize: 14 }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </div>
      </ChartCard>

      {/* Blood Pressure Category Analysis */}
      <ChartCard
        title="% of Patients in Blood Pressure Categories"
        style={{ height: "400px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BarChart
            width={900}
            height={350}
            data={bpAnalysis}
            margin={{ top: 20, right: 30, left: 50, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            {/* X-Axis */}
            <XAxis
              dataKey="bp_category"
              interval={0}
              angle={0}
              textAnchor="middle"
              tick={{ fill: "white" }}
            >
              <Label
                value="Blood Pressure Categories"
                fontSize={20}
                offset={60}
                position="bottom"
                fill="#b0e8f9ff"
              />
            </XAxis>

            {/* Y-Axis */}
            <YAxis tick={{ fill: "white" }}>
              <Label
                value="Patient %"
                fontSize={20}
                angle={-90}
                position="insideLeft"
                offset={-15}
                fill="#b0e8f9ff"
              />
            </YAxis>

            <Tooltip />

            <Bar
              name="Disease Percentage %"
              dataKey="disease_percentage"
              fill="#1f7d9aff"
              barSize={80}
            />
          </BarChart>
        </div>
      </ChartCard>

      {/* Cholesterol Analysis */}
      <ChartCard
        title="Cholesterol Levels vs Disease"
        style={{ height: "600px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BarChart
            width={900}
            height={450}
            data={cholesterolAnalysis}
            margin={{ top: 20, right: 30, left: 50, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            {/* X-Axis */}
            <XAxis
              dataKey="label"
              interval={0}
              angle={0}
              textAnchor="middle"
              tick={({ x, y, payload }) => {
                const info = cholesterolAnalysis.find(
                  (item) => item.label === payload.value
                );
                return (
                  <text
                    x={x}
                    y={y + 15}
                    textAnchor="middle"
                    fill="white"
                    fontSize={14}
                  >
                    <tspan x={x} dy="0">
                      {payload.value}
                    </tspan>
                    {/* The API doesn't return the range, so we comment this out for now
                    <tspan x={x} dy="18" fontSize={12} fill="#c5f9f1ff">
                      {info?.range} 
                    </tspan> */}
                  </text>
                );
              }}
            >
              <Label
                value="Cholesterol Levels"
                fontSize={20}
                offset={60}
                position="bottom"
                fill="#c5f9f1ff"
              />
            </XAxis>

            {/* Y-Axis */}
            <YAxis tick={{ fill: "white" }}>
              <Label
                value="Disease %"
                fontSize={20}
                angle={-90}
                position="insideLeft"
                offset={-15}
                fill="#c5f9f1ff"
              />
            </YAxis>

            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />

            <Bar
              name="Disease Percentage %"
              dataKey="disease_percentage"
              fill="#00b597ff"
              barSize={100}
            />
          </BarChart>
        </div>
      </ChartCard>

      {/* Glucose Levels vs Disease */}
      <ChartCard title="Glucose Levels vs Disease" style={{ height: "600px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BarChart
            width={900}
            height={400}
            data={glucoseAnalysis}
            margin={{ top: 20, right: 30, left: 50, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            {/* X-Axis */}
            <XAxis
              dataKey="label"
              interval={0}
              angle={0}
              textAnchor="middle"
              tick={({ x, y, payload }) => {
                const info = glucoseAnalysis.find(
                  (item) => item.label === payload.value
                );
                return (
                  <text
                    x={x}
                    y={y + 15}
                    textAnchor="middle"
                    fill="white"
                    fontSize={14}
                  >
                    <tspan x={x} dy="0">
                      {payload.value}
                    </tspan>
                    {/* The API doesn't return the range, so we comment this out for now
                    <tspan x={x} dy="18" fontSize={12} fill="#c5f9f1ff">
                      {info?.range}
                    </tspan> */}
                  </text>
                );
              }}
            >
              <Label
                value="Glucose Levels"
                fontSize={20}
                offset={60}
                position="bottom"
                fill="#e8dbffff"
              />
            </XAxis>

            {/* Y-Axis */}
            <YAxis tick={{ fill: "white" }}>
              <Label
                value="Disease %"
                fontSize={20}
                angle={-90}
                position="insideLeft"
                offset={-15}
                fill="#e8dbffff"
              />
            </YAxis>

            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />

            <Bar
              name="Disease Percentage %"
              dataKey="disease_percentage"
              fill="#854e86ff"
              barSize={100} // slimmer bars, consistent
            />
          </BarChart>
        </div>
      </ChartCard>

      {/* High-Risk Overview */}
      <ChartCard title="High-Risk Patients Overview">
        <div
          style={{
            display: "flex",
            justifyContent: "center", // Center the content
            alignItems: "center",
            gap: "40px",
            flexWrap: "wrap",
          }}
        >
          {/* Radial Chart for High-Risk % */}
          <RadialBarChart
            width={220}
            height={220}
            innerRadius="70%"
            outerRadius="100%"
            data={[
              {
                name: "High-Risk %",
                value: highRiskProfile.high_risk_percentage || 0,
              },
            ]}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              minAngle={15}
              background
              clockWise
              dataKey="value"
              fill="#FF7043"
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              style={{ fontSize: "20px", fontWeight: "bold" }}
            >
              {highRiskProfile.high_risk_percentage?.toFixed(1) || 0}%
            </text>
          </RadialBarChart>

          {/* Right Side Stats */}
          <div style={{ color: "#fff", fontSize: "16px", textAlign: "left" }}>
            <p>
              <strong>Total High-Risk Patients:</strong>{" "}
              {highRiskProfile.total_high_risk || 0}
            </p>

            <p>
              <strong>Disease Rate in High-Risk Patients:</strong>{" "}
              {highRiskProfile.disease_rate_in_high_risk?.toFixed(1) || 0}%
            </p>

            {/* Disease Progress Bar */}
            <div style={{ marginTop: "15px" }}>
              <p style={{ marginBottom: "6px" }}>
                <strong>Disease Progress:</strong> % of high-risk patients who
                have the disease
              </p>
              <div
                style={{
                  width: "200px",
                  height: "16px",
                  background: "#333",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${highRiskProfile.disease_rate_in_high_risk || 0}%`,
                    height: "100%",
                    background: "#29B6F6",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Explanatory Labels Below */}
        <div
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#fff",
            fontSize: "14px",
          }}
        >
          <p>
            <strong>High-Risk %:</strong> Proportion of patients flagged as
            high-risk.
          </p>
          <p>
            <strong>Disease Progress:</strong> Percentage of high-risk patients
            who actually have the disease.
          </p>
        </div>
      </ChartCard>

      {/* Overall Stats */}
      <ChartCard title="Overall Statistics">
        <div
          style={{
            fontSize: "16px",
            display: "inline-grid",
            gridTemplateColumns: "repeat(3, 200px)",
            gap: "20px",
          }}
        >
          {/* Total Patients */}
          <div
            style={{
              background: "#295a82ff",
              padding: "15px",
              borderRadius: "10px",
              color: "#fff",
              textAlign: "center",
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            }}
          >
            <h3>{stats.total_patients || 0}</h3>
            <p>Total Patients</p>
          </div>

          {/* Average Age */}
          <div
            style={{
              background: "#6e3378ff",
              padding: "15px",
              borderRadius: "10px",
              color: "#fff",
              textAlign: "center",
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            }}
          >
            <h3>{stats.avg_age?.toFixed(1) || 0}</h3>
            <p>Average Age</p>
          </div>

          {/* Disease Prevalence */}
          <div
            style={{
              background: "#c0441eff",
              padding: "15px",
              borderRadius: "10px",
              color: "#fff",
              textAlign: "center",
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            }}
          >
            <h3>{stats.disease_prevalence_percentage?.toFixed(1) || 0}%</h3>
            <p>Overall Disease Prevalence</p>
          </div>

          {/* Average BMI */}
          <div
            style={{
              background: "#00645aff",
              padding: "15px",
              borderRadius: "10px",
              color: "#fff",
              textAlign: "center",
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            }}
          >
            <h3>{stats.avg_bmi?.toFixed(1) || 0}</h3>
            <p>Average BMI</p>
          </div>

          {/* High BP % */}
          <div
            style={{
              background: "#a83a64ff",
              padding: "15px",
              borderRadius: "10px",
              color: "#fff",
              textAlign: "center",
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            }}
          >
            <h3>{stats.high_bp_percentage?.toFixed(1) || 0}%</h3>
            <p>High BP %</p>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
