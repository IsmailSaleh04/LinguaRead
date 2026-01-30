'use client';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  label?: string;
}

export default function Select({ options, label, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-base font-bold text-dark mb-2">{label}</label>}
      <select
        className={`w-full px-4 py-3 bg-white border-2 border-brown rounded-lg 
                   text-dark font-semibold focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange focus:ring-opacity-20 transition-all ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
