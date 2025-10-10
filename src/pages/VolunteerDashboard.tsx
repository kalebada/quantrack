import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Plus } from "lucide-react";
import { MemberQRCode } from "@/components/MemberQRCode";
import { OrganizationCard } from "@/components/OrganizationCard";
import { OrganizationDetail } from "./OrganizationDetail";

const VolunteerDashboard = () => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Mock data - will be replaced with actual data from Supabase
  const member = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "John Smith",
  };

  const organizations = [
    { id: "1", name: "Community Food Bank", logoUrl: "", level: 5, totalPoints: 4250 },
    { id: "2", name: "Youth Education Center", logoUrl: "", level: 3, totalPoints: 2800 },
    { id: "3", name: "Local Animal Shelter", logoUrl: "", level: 7, totalPoints: 6540 },
  ];

  if (selectedOrgId) {
    return (
      <OrganizationDetail
        organizationId={selectedOrgId}
        onBack={() => setSelectedOrgId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="text-xl font-bold">Quantrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Profile
            </Button>
            <Button variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back, {member.name}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">Track your engagement and multiply your impact</p>
        </div>

        {/* QR Code Button */}
        <div className="mb-8 flex justify-center">
          <Button
            onClick={() => setShowQRCode(true)}
            size="lg"
            className="bg-gradient-to-r from-primary via-accent to-primary hover:shadow-glass transition-all duration-300 text-lg px-8 py-6 rounded-2xl group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl group-hover:blur-2xl transition-all" />
            <QrCode className="w-6 h-6 mr-3 relative z-10" />
            <span className="relative z-10 font-semibold">My Code</span>
          </Button>
        </div>

        {/* Organizations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">My Organizations</h2>
            <Button variant="hero" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Join Organization
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <OrganizationCard
                key={org.id}
                id={org.id}
                name={org.name}
                logoUrl={org.logoUrl}
                level={org.level}
                totalPoints={org.totalPoints}
                onClick={() => setSelectedOrgId(org.id)}
              />
            ))}

            {/* Add New Org Card */}
            <Card className="p-6 bg-card/40 backdrop-blur-sm border-dashed border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group flex items-center justify-center min-h-[180px]">
              <div className="text-center">
                <Plus className="w-10 h-10 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  Join New Organization
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <MemberQRCode
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        memberId={member.id}
        memberName={member.name}
      />
    </div>
  );
};

export default VolunteerDashboard;
