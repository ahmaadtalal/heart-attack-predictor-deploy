import React, { useRef, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "./HealthGuide.css";
// import NavbarUser from "../NavbarUser/NavbarUser";
import BackToTopButton from "../BackToTopButton.tsx";

export default function HealthGuide({ userName, onLogout }) {
  // FIX: Add the missing state declaration here
  const [, setAnimate] = useState(false);

  // The original useEffect hook is now correctly referencing the setter
  useEffect(() => {
    document.title = "CardioCare | Cardio Guide";
    setAnimate(true);
  }, []);
  const lowRef = useRef(null);
  const mediumRef = useRef(null);
  const highRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  const downloadPDF = async (sectionRef, filename) => {
    const element = sectionRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename + ".pdf");
  };

  return (
    <div>
      {/* NAVBAR — single, clean, global */}
      {/* <NavbarUser userName={userName} onLogout={onLogout} /> */}

      <h1>Heart Risk — Full Cardio Health Guide</h1>

      <div className="risk-buttons">
        <button className="btn-low" onClick={() => scrollToSection(lowRef)}>
          Low Risk
        </button>
        <button
          className="btn-medium"
          onClick={() => scrollToSection(mediumRef)}
        >
          Medium Risk
        </button>
        <button className="btn-high" onClick={() => scrollToSection(highRef)}>
          High Risk
        </button>
      </div>

      <BackToTopButton />

      {/* LOW SECTION */}
      <Section
        refProp={lowRef}
        title="Cardio Health Guide — Low Risk"
        headingColor="#009966ff"
        badge="🟢 LOW RISK"
        badgeClass="green-badge"
        heading="Keep Your Heart Strong"
        downloadPDF={() => downloadPDF(lowRef, "Low Risk")}
        foods={[
          "Leafy greens — antioxidants reduce inflammation.",
          "Broccoli & carrots — fiber supports cholesterol balance.",
          "Oily fish (salmon) — omega-3 fatty acids improve heart function.",
          "Beans & lentils — protein & fiber stabilize blood sugar.",
          "Whole grains (oats, quinoa) — digestion & cholesterol improvement.",
          "Olive oil & nuts — healthy fats for arteries.",
        ]}
        exercises={[
          { name: "Brisk Walking", detail: "30min × 5/week" },
          { name: "Yoga / Stretching", detail: "10–20min daily" },
          { name: "Resistance Training", detail: "1–2 sessions/week" },
        ]}
        exerciseNote="Focus on light/moderate activities to maintain heart health."
        lifestyles={[
          "Sleep 7–8h/night",
          "Stress management with meditation",
          "Stay hydrated and limit caffeine/alcohol",
        ]}
        plateImage={require("../../Assets/guide-assets/Low-risk_food-plate.png")}
        exerciseImages={[
          require("../../Assets/guide-assets/Brisk-walking.jpg"),
          require("../../Assets/guide-assets/Yoga-stretching.jpg"),
          require("../../Assets/guide-assets/Resistance-training.jpg"),
        ]}
        lifestyleImages={[
          require("../../Assets/guide-assets/7-8_hrs_sleep.jpg"),
          require("../../Assets/guide-assets/Stress-management-meditation.jpg"),
          require("../../Assets/guide-assets/Stay-hydrated.jpg"),
        ]}
      />

      {/* MEDIUM SECTION */}
      <Section
        refProp={mediumRef}
        title="Cardio Health Guide — Medium Risk"
        headingColor="#e98400ff"
        badge="🟡 MEDIUM RISK"
        badgeClass="orange-badge"
        heading="Improve & Stabilize"
        downloadPDF={() => downloadPDF(mediumRef, "Medium Risk")}
        foods={[
          "Oats, barley — soluble fiber lowers LDL.",
          "Lentils, beans — stabilize blood sugar.",
          "Salmon, mackerel — omega-3 reduces inflammation.",
          "Walnuts & flax seeds — improve lipid profile.",
          "Spinach, kale — antioxidants support vessels.",
          "Berries — antioxidants improve vascular function.",
        ]}
        exercises={[
          { name: "Cardio", detail: "40min 4–5×/week" },
          { name: "Strength Training", detail: "20–30min 3×/week" },
          { name: "Flexibility / Yoga", detail: "10–15min daily" },
        ]}
        exerciseNote="Monitor BP, weight, and heart rate weekly for best results."
        lifestyles={[
          "Reduce salt intake",
          "Meditation & mindfulness",
          "Track weight & vitals weekly",
        ]}
        plateImage={require("../../Assets/guide-assets/mediumRisk_food_plate.png")}
        exerciseImages={[
          require("../../Assets/guide-assets/Cardio.jpg"),
          require("../../Assets/guide-assets/Strenght-training.jpg"),
          require("../../Assets/guide-assets/Flexibility-yoga.jpg"),
        ]}
        lifestyleImages={[
          require("../../Assets/guide-assets/Reduce-salt.jpg"),
          require("../../Assets/guide-assets/Meditation-mindfullness.jpg"),
          require("../../Assets/guide-assets/track-weight-vitals.jpg"),
        ]}
      />

      {/* HIGH SECTION */}
      <Section
        refProp={highRef}
        title="Cardio Health Guide — High Risk"
        headingColor="#e32020ff"
        badge="🔴 HIGH RISK"
        badgeClass="red-badge"
        heading="Take Action Now"
        downloadPDF={() => downloadPDF(highRef, "High Risk")}
        foods={[
          "Leafy greens & broccoli — antioxidants, reduce oxidative stress.",
          "Legumes — protein & fiber stabilize sugar/cholesterol.",
          "Whole grains — fiber & sustained energy.",
          "Fatty fish occasionally — omega-3 anti-inflammatory.",
          "Berries & citrus — vitamin C antioxidant protection.",
          "Minimize red meat & processed foods — reduce plaque formation.",
        ]}
        exercises={[
          { name: "Short Walks", detail: "10–15min × 2–3/day" },
          { name: "Chair Exercises", detail: "Light movements" },
          { name: "Breathing / Stretching", detail: "10min daily" },
        ]}
        exerciseNote="Follow doctor’s guidance. Focus on gentle movements and monitoring vitals carefully."
        lifestyles={[
          "Follow prescribed medications",
          "Regular check-ups & monitoring",
          "Quit smoking & limit alcohol",
        ]}
        plateImage={require("../../Assets/guide-assets/Highrisk_food_plate.png")}
        exerciseImages={[
          require("../../Assets/guide-assets/Short-walks.jpg"),
          require("../../Assets/guide-assets/Chair-exercises.jpg"),
          require("../../Assets/guide-assets/Breathing-Stretching.jpg"),
        ]}
        lifestyleImages={[
          require("../../Assets/guide-assets/Follow-prescribed-medications.jpg"),
          require("../../Assets/guide-assets/Regular-checkups.jpg"),
          require("../../Assets/guide-assets/Quit-smoking.jpg"),
        ]}
      />
    </div>
  );
}

/* --------------------------------------
   SECTION COMPONENT (No navbar here)
--------------------------------------- */

const Section = ({
  refProp,
  title,
  badge,
  badgeClass,
  heading,
  headingColor,
  downloadPDF,
  foods,
  exercises,
  exerciseNote,
  lifestyles,
  plateImage,
  exerciseImages,
  lifestyleImages,
}) => {
  return (
    <div className="section-card" ref={refProp}>
      <h2 className="guide-heading" style={{ color: headingColor }}>
        {title}
      </h2>

      <div className="section-header">
        <span className={`badge ${badgeClass}`}>{badge}</span>
        {heading && <h2 style={{ color: headingColor }}>{heading}</h2>}
      </div>

      {/* FOOD */}
      <div className="food-section">
        <div className="plate-diagram">
          <img src={plateImage} alt="Plate" />
        </div>

        <div className="food-list">
          <h3>Foods & Benefits</h3>
          <ul>
            {foods.map((food, i) => (
              <li key={i}>
                <strong>{food.split(" — ")[0]}</strong> — {food.split(" — ")[1]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* EXERCISES */}
      <h3>Recommended Exercises</h3>
      <div className="exercise-section">
        {exercises.map((ex, i) => (
          <div className="exercise-card" key={i}>
            <div>
              <strong>{ex.name}</strong>
            </div>

            <div className="image-placeholder">
              <img src={exerciseImages[i]} alt={ex.name} />
            </div>

            <p>{ex.detail}</p>
          </div>
        ))}
      </div>

      <p>{exerciseNote}</p>

      {/* LIFESTYLES */}
      <h3>Lifestyle & Habits</h3>
      <div className="lifestyle-section">
        {lifestyles.map((life, i) => (
          <div className="lifestyle-card" key={i}>
            <div className="image-placeholder">
              <img src={lifestyleImages[i]} alt={life} />
            </div>
            <p>{life}</p>
          </div>
        ))}
      </div>

      <div className="pdf-buttons">
        <button className="pdf-green" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
    </div>
  );
};
