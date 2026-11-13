import React from "react";

/**
 * Renders text containing LaTeX math ($...$), Unicode superscripts/subscripts,
 * or standard text cleanly with Bengali and English typography.
 */
export default function MathText({ text, className = "" }) {
  if (!text) return null;

  // Split on inline math markers like $...$
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span className={`inline leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1);
          return (
            <span
              key={index}
              className="inline-block px-1 font-mono font-medium text-[#1E3A8A] bg-[#EFF6FF] rounded text-[0.95em]"
            >
              {formula}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
