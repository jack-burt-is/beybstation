import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "cyan";
  size?: "md" | "sm";
  block?: boolean;
  icon?: LucideIcon;
  children?: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  block = false,
  icon: Icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  const cls = [
    "btn",
    `btn--${variant}`,
    size === "sm" && "btn--sm",
    block && "btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconSize = size === "sm" ? 14 : 18;

  return (
    <button className={cls} {...rest}>
      {Icon && <Icon size={iconSize} />}
      {children}
    </button>
  );
}
