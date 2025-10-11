import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatHours, getMedalInfo } from "@/lib/formatters";
import { Trophy } from "lucide-react";

interface LeaderboardMember {
  id: string;
  name: string;
  avatarUrl?: string;
  totalHours: number;
  rank: number;
}

interface LeaderboardProps {
  members: LeaderboardMember[];
  currentUserId?: string;
}

export const Leaderboard = ({ members, currentUserId }: LeaderboardProps) => {
  return (
    <div className="space-y-3">
      {members.map((member) => {
        const medal = getMedalInfo(member.totalHours);
        const isCurrentUser = member.id === currentUserId;
        
        return (
          <Card
            key={member.id}
            className={`bg-card/70 backdrop-blur-sm border-border transition-all ${
              isCurrentUser ? "ring-2 ring-primary/50 border-primary/50" : ""
            }`}
          >
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {member.rank <= 3 && (
                    <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-white shadow-lg z-10">
                      {member.rank}
                    </div>
                  )}
                  <Avatar className="w-14 h-14 border-2 border-primary/20">
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">
                      {member.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`bg-gradient-to-r ${medal.color} text-white border-0`}
                    >
                      {medal.emoji} {medal.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatHours(member.totalHours)}
                    </span>
                  </div>
                </div>
                
                {member.rank <= 3 && (
                  <div className="text-right">
                    <Trophy
                      className={`w-8 h-8 ${
                        member.rank === 1
                          ? "text-yellow-500"
                          : member.rank === 2
                          ? "text-gray-400"
                          : "text-amber-700"
                      }`}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
