import React from "react";
import { Link } from "react-router-dom";

export default function ExaminoLogo({ light = false, size = "md", to = "/dashboard" }) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const badgeSize = isSm ? "w-7 h-7 text-xs" : isLg ? "w-11 h-11 text-lg" : "w-9 h-9 text-sm";
  const textSize = isSm ? "text-base" : isLg ? "text-2xl" : "text-xl";

  const content = (
    <div className="flex items-center gap-2.5 select-none group">
      {/* Official Navy Square Logo Badge */}
      <div
        className={`${badgeSize} rounded-lg flex items-center justify-center font-bold tracking-tight text-white transition-transform group-hover:scale-105 shadow-sm`}
        style={{ background: "#101B35" }}
      >
        <span className="font-extrabold flex items-center justify-center">
          <span className="text-white">E</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] ml-0.5 mt-2"></span>
        </span>
      </div>
      {/* Brand Text */}
      <span
        className={`font-bold tracking-tight ${textSize} ${
          light ? "text-white" : "text-[#0F172A]"
        }`}
      >
        Examino
      </span>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block focus:outline-none">{content}</Link>;
  }

  return content;
}
