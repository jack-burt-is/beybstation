import type { ReactNode } from "react";

interface HeaderProps {
  kicker?: string;
  onHome?: () => void;
  right?: ReactNode;
}

export default function Header({ kicker, onHome, right }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand" onClick={onHome}>
        <img src="/logo.png" alt="BEYBSTATION" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {kicker && <span className="meta">{kicker}</span>}
        {right}
      </div>
    </header>
  );
}
