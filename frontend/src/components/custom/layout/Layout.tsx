import Sidebar from "@/components/Sidebar";
import React, { useState, useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  // State for controlling sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set the initial state of the sidebar based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isSidebarOpen) {
        setIsSidebarOpen(false); // Close sidebar when the screen is less than 1024px wide
      } else if (window.innerWidth >= 1024 && !isSidebarOpen) {
        setIsSidebarOpen(true); // Open sidebar when the screen is 1024px or more wide
      }
    };
  
    handleResize(); // Initialize on component mount
    window.addEventListener("resize", handleResize); // Listen for resize events
  
    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup listener on unmount
    };
  }, [window.innerWidth]);

  return (
    <div className="grid grid-cols-[auto,1fr] h-screen">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "md:w-[300px]" : "w-[80px]"
        }`}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-grow py-7 px-10 overflow-auto bg-content h-[100dvh]">
        {children}
      </div>
    </div>
  );
}
