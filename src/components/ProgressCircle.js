import React from "react";

const ProgressCircle = ({
  value = 0,
  max = 1,
  size = 80,
  strokeWidth = 8,
  color = "#1e88e5",
  bgColor = "#e0e0e0",
  showPercentage = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // prevent division by zero
  const safeMax = max === 0 ? 1 : max;

  // clamp between 0 and 1
  const percent = Math.min(Math.max(value / safeMax, 0), 1);

  const offset = circumference * (1 - percent);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={size} height={size} className="progress-circle">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* Percentage Text (hidden at 100%) */}
      {showPercentage && percent < 1 && (
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "0.8rem",
            fontWeight: "600",
            color: color
          }}
        >
          {Math.round(percent * 100)}%
        </span>
      )}
    </div>
  );
};

export default ProgressCircle;
