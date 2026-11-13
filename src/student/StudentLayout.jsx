import React from "react";
import StudentNavbar from "./StudentNavbar";

export default function StudentLayout({ children, maxWidth = "max-w-7xl" }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <StudentNavbar />
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-12 ${maxWidth}`}>
        {children}
      </main>
    </div>
  );
}
