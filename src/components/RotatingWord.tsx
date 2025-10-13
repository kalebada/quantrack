import { useState, useEffect } from "react";

const words = [
  "teams",
  "groups",
  "non-profits",
  "clubs",
  "organizations",
  "foundations",
  "institutes"
];

export const RotatingWord = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative w-[180px] h-[1.5em] align-middle overflow-hidden">
      <span
        className={`
          absolute inset-0 flex items-center justify-center
          font-bold text-primary
          transition-all duration-300
          ${isAnimating ? "opacity-0 translate-y-[-100%] blur-sm scale-90" : "opacity-100 translate-y-0 blur-0 scale-100"}
        `}
        style={{
          textShadow: `
            0 0 20px hsl(var(--primary) / 0.6),
            0 0 40px hsl(var(--primary) / 0.4),
            0 0 60px hsl(var(--primary) / 0.2)
          `,
          filter: "brightness(1.2)"
        }}
      >
        {words[currentIndex]}
      </span>
      {isAnimating && (
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-primary opacity-0 translate-y-[100%] blur-sm scale-90 transition-all duration-300"
          style={{
            textShadow: `
              0 0 20px hsl(var(--primary) / 0.6),
              0 0 40px hsl(var(--primary) / 0.4),
              0 0 60px hsl(var(--primary) / 0.2)
            `,
            filter: "brightness(1.2)"
          }}
        >
          {words[(currentIndex + 1) % words.length]}
        </span>
      )}
    </span>
  );
};
