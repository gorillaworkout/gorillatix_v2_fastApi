"use client"
import { useEffect, useState } from "react";

interface LoadingProps {
  title : string
}
export default function Loader({title}: LoadingProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="text-3xl font-bold tracking-wide text-red-600 animate-pulse">
        GorillaTix
      </div>

      <div className="mt-4 w-14 h-14 border-4 border-dashed border-red-700 rounded-full animate-spin" />

      <div className="mt-4 text-sm text-gray-400 italic">
        {title}{dots}
      </div>
    </div>
  );
}
