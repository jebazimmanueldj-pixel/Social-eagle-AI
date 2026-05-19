import { Download } from "lucide-react";

interface Props {
  href?: string;
  onClick?: () => void;
  label?: string;
}

export default function ExportButton({ href, onClick, label = "Export" }: Props) {
  if (href) {
    return (
      <a href={href} className="btn-secondary" target="_blank" rel="noreferrer">
        <Download className="h-4 w-4" /> {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} className="btn-secondary">
      <Download className="h-4 w-4" /> {label}
    </button>
  );
}
