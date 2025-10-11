import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatHours, getMedalInfo, getMedalProgress } from "@/lib/formatters";

interface OrganizationCardProps {
  id: string;
  name: string;
  logoUrl?: string;
  level: number;
  totalPoints: number;
  onClick: () => void;
}

export const OrganizationCard = ({ name, logoUrl, totalPoints, onClick }: OrganizationCardProps) => {
  // Convert points to hours (1 point = 1 minute)
  const totalHours = totalPoints / 60;
  const medal = getMedalInfo(totalHours);
  const progress = getMedalProgress(totalHours);

  return (
    <Card
      onClick={onClick}
      className="p-6 bg-card/70 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glass cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl overflow-hidden border border-primary/20">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span>🏢</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors text-lg">
            {name}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="default"
              className={`bg-gradient-to-r ${medal.color} border-0 text-white`}
            >
              {medal.emoji} {medal.name}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatHours(totalHours)}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${medal.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {medal.maxHours && (
              <p className="text-xs text-muted-foreground">
                {formatHours(medal.maxHours - totalHours)} to {getMedalInfo(medal.maxHours).name}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
