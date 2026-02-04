import React, { useEffect, useState } from "react";
import "../styles/newYearTheme.css";

const CONFETTI_COUNT = 80;

const NewYearConfetti = () => {
  const [seed, setSeed] = useState(0);

  // 🔁 Re-generate confetti every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSeed((s) => s + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="confetti-wrapper" key={seed}>
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <span
          key={`${seed}-${i}`}
          className="confetti"
          style={{
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
};

export default NewYearConfetti;
