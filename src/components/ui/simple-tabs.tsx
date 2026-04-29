"use client";
import { cn } from "@/lib/utils";

export function Tabs({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="border-b border-slate-800">
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-2 text-sm border-b-2 transition-colors",
              value === opt.value
                ? "border-red-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
