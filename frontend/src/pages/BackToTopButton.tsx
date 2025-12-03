import { useEffect, useState } from "react";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300); // show button after 300px
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom: "40px",
        right: "40px",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: "bold",
        backgroundColor: "rgba(122, 20, 68, 0.8)",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        zIndex: 999,
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        transition: "background 0.3s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(74, 14, 42, 0.93)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(122, 20, 68, 0.933)")
      }
      aria-label="Back to Top"
    >
      ↑ Back to Top
    </button>
  );
};

export default BackToTopButton;
