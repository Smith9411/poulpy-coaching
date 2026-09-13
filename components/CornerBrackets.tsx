"use client";

interface CornerBracketsProps {
  color?: "coral" | "slate" | "white";
  size?: number;
}

const COLORS = {
  coral: "#FF7582",
  slate: "#8FAFD4",
  white: "rgba(255,255,255,0.5)",
};

export default function CornerBrackets({ color = "coral", size = 14 }: CornerBracketsProps) {
  const c = COLORS[color];
  const s = `${size}px`;
  const base = "bracket-corner pointer-events-none absolute z-20";

  return (
    <>
      <span className={`${base} bracket-tl`} style={{ width: s, height: s, borderColor: c }} />
      <span className={`${base} bracket-tr`} style={{ width: s, height: s, borderColor: c }} />
      <span className={`${base} bracket-bl`} style={{ width: s, height: s, borderColor: c }} />
      <span className={`${base} bracket-br`} style={{ width: s, height: s, borderColor: c }} />
    </>
  );
}
