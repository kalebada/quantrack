/**
 * Converts decimal hours to formatted string like "3h 42m"
 */
export const formatHours = (decimalHours: number): string => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  
  if (hours === 0 && minutes === 0) return "0m";
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  
  return `${hours}h ${minutes}m`;
};

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Get medal type and color based on total hours
 */
export type MedalType = "bronze" | "silver" | "gold" | "platinum";

export interface MedalInfo {
  type: MedalType;
  name: string;
  emoji: string;
  color: string;
  minHours: number;
  maxHours?: number;
}

export const getMedalInfo = (totalHours: number): MedalInfo => {
  if (totalHours >= 200) {
    return {
      type: "platinum",
      name: "Platinum",
      emoji: "💎",
      color: "from-cyan-400 to-blue-500",
      minHours: 200,
    };
  } else if (totalHours >= 100) {
    return {
      type: "gold",
      name: "Gold",
      emoji: "🥇",
      color: "from-yellow-400 to-yellow-600",
      minHours: 100,
      maxHours: 200,
    };
  } else if (totalHours >= 50) {
    return {
      type: "silver",
      name: "Silver",
      emoji: "🥈",
      color: "from-gray-300 to-gray-500",
      minHours: 50,
      maxHours: 100,
    };
  } else {
    return {
      type: "bronze",
      name: "Bronze",
      emoji: "🥉",
      color: "from-amber-600 to-amber-800",
      minHours: 0,
      maxHours: 50,
    };
  }
};

/**
 * Calculate progress percentage to next medal tier
 */
export const getMedalProgress = (totalHours: number): number => {
  const medal = getMedalInfo(totalHours);
  
  if (!medal.maxHours) return 100; // Platinum is max
  
  const hoursInTier = totalHours - medal.minHours;
  const tierRange = medal.maxHours - medal.minHours;
  
  return (hoursInTier / tierRange) * 100;
};
