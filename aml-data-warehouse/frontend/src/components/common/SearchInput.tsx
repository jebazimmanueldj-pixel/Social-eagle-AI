import { Search } from "lucide-react";
import { ChangeEventHandler } from "react";

interface Props {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ value, onChange, placeholder, className }: Props) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? "Search…"}
        className="input pl-9"
      />
    </div>
  );
}
