import { useState } from "react";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  height?: string;
}

export function FlipCard({ front, back, height = "h-44" }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className={`flip-card w-full ${height} text-left`}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
        <div className="flip-card-front">{front}</div>
        <div className="flip-card-back">{back}</div>
      </div>
    </button>
  );
}
