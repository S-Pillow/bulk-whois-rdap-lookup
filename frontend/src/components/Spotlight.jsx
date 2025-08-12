import React, { useEffect, useRef } from "react";

const Spotlight = () => {
  const spotlightRef = useRef(null);

  useEffect(() => {
    const spotlight = spotlightRef.current;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      spotlight.style.background = `radial-gradient(circle at ${clientX}px ${clientY}px, rgba(50, 50, 50, 0.3), transparent 300px)`;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 transition-opacity duration-300"
    ></div>
  );
};

export default Spotlight;
