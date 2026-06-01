import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, id, ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      {label && (
        <label className="bey-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className="bey-input" {...rest} />
    </div>
  );
}
