import type { ReactNode } from "react";

type BadgeKind = "live" | "wait" | "win";

export default function Badge({ kind = "wait", children }: { kind?: BadgeKind; children: ReactNode }) {
  return <span className={`bey-badge bey-badge--${kind}`}>{children}</span>;
}
