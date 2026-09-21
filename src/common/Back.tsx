"use client";

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({
  label = "Back",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 px-3 py-2 mb-3 border rounded-md bg-gray-100 hover:bg-gray-200 ${className}`}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}