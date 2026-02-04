import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";

const NewYearAnimation = () => {
  const [show, setShow] = useState(true);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: 200, // 👈 only top area
  });

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 4000); // 4 sec
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const resize = () =>
      setSize({ width: window.innerWidth, height: 200 });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  if (!show) return null;

  return (
    <Confetti
      width={size.width}
      height={size.height}
      numberOfPieces={120}
      gravity={0.2}
      colors={["#FFD700", "#FFFFFF", "#F5C16C"]}
      recycle={false}
    />
  );
};

export default NewYearAnimation;
