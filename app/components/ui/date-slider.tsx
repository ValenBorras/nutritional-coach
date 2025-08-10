"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface DateSliderProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

interface DropdownProps {
  value: string | number;
  options: { value: number; label: string }[];
  onChange: (value: number) => void;
  className?: string;
}

function Dropdown({ value, options, onChange, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: number) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-sm bg-warm-sand-50 border border-warm-sand-200 rounded-md focus:outline-none focus:ring-1 focus:ring-coral/60 focus:border-coral/60 transition-colors"
      >
        <span className="text-gray-700">{selectedOption?.label || value}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-stone-50 border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full text-left px-2 py-1.5 text-sm hover:bg-coral hover:text-white transition-colors duration-150
                  ${
                    option.value === value
                      ? "bg-coral text-white font-medium"
                      : "text-gray-700"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DateSlider({
  name,
  value,
  onChange,
  required,
}: DateSliderProps) {
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2000);

  // Parse initial value if provided
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setDay(date.getDate());
        setMonth(date.getMonth() + 1);
        setYear(date.getFullYear());
      }
    }
  }, [value]);

  // Update parent when values change
  useEffect(() => {
    const dateString = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    onChange?.(dateString);
  }, [day, month, year, onChange]);

  // Get days in current month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Adjust day if it exceeds days in selected month
  useEffect(() => {
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [daysInMonth, day]);

  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = currentYear;

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Generate options for dropdowns
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString(),
  }));

  const monthOptions = monthNames.map((name, index) => ({
    value: index + 1,
    label: name,
  }));

  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    value: maxYear - i, // Start from current year and go backwards
    label: (maxYear - i).toString(),
  }));

  return (
    <div className="space-y-2">
      <input
        type="hidden"
        name={name}
        value={`${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`}
        required={required}
      />

      <div className="grid grid-cols-3 gap-2">
        <Dropdown value={day} options={dayOptions} onChange={setDay} />

        <Dropdown value={month} options={monthOptions} onChange={setMonth} />

        <Dropdown value={year} options={yearOptions} onChange={setYear} />
      </div>
    </div>
  );
}
