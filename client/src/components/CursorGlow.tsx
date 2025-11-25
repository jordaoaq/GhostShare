import React, { useEffect, useState } from "react";

const CursorGlow: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-0"
      style={{
        left: 0,
        top: 0,
        width: "600px",
        height: "600px",
        background:
          "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
        transform: `translate(${position.x - 300}px, ${position.y - 300}px)`,
        filter: "blur(40px)",
        transition: "transform 0.1s ease-out", // Smooth movement
      }}
    />
  );
};

export default CursorGlow;
