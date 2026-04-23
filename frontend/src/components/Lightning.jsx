import React from "react";

export function Lightning({ className = "", side = "right" }) {
  const flip = side === "left" ? "scale-x-[-1]" : "";
  return (
    <svg
      viewBox="0 0 48 64"
      className={`pointer-events-none bolt-shine ${flip} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M28 2 L10 34 L22 34 L16 62 L40 26 L26 26 L34 2 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M28 2 L10 34 L22 34 L16 62 L40 26 L26 26 L34 2 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.35"
      />
    </svg>
  );
}

export function CornerBolts() {
  return (
    <>
      <Lightning
        side="right"
        className="absolute top-2 right-2 w-6 h-8 md:w-8 md:h-10 opacity-80"
      />
      <Lightning
        side="left"
        className="absolute bottom-2 left-2 w-5 h-7 md:w-7 md:h-9 opacity-60"
      />
    </>
  );
}

export default Lightning;
