import React from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, bgColor }) => (
  <div className={`p-4 rounded-lg shadow-md text-white ${bgColor}`}>
    <div className="flex items-center">
      {icon}
      <div className="ml-4">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

export default SummaryCard;