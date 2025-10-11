import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Search, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

type VerificationResult = {
  type: "certificate" | "member";
  data: any;
};

const Verify = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!code.trim()) {
      toast.error("Please enter a code to verify");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Try to verify as certificate first
      const { data: certificate, error: certError } = await supabase
        .from("certificates")
        .select(`
          *,
          profiles!certificates_volunteer_id_fkey(full_name),
          organizations(name, logo_url)
        `)
        .eq("certificate_code", code)
        .single();

      if (certificate && !certError) {
        setResult({ type: "certificate", data: certificate });
        setLoading(false);
        return;
      }

      // Try to verify as member ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          volunteer_profiles(*)
        `)
        .eq("id", code)
        .single();

      if (profile && !profileError) {
        // Fetch volunteer sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from("volunteer_sessions")
          .select(`
            *,
            organizations(name, logo_url)
          `)
          .eq("volunteer_id", code)
          .order("session_date", { ascending: false });

        if (sessionsError) throw sessionsError;

        setResult({ 
          type: "member", 
          data: { profile, sessions: sessions || [] }
        });
      } else {
        toast.error("No matching certificate or member ID found");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error("Verification failed. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Verify Credentials
            </h1>
            <p className="text-muted-foreground">
              Enter a certificate code or member ID to verify volunteer credentials
            </p>
          </div>

          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Enter Verification Code</CardTitle>
              <CardDescription>
                This can be either a certificate code or a member ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={handleVerify} disabled={loading || !code.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && result.type === "certificate" && (
            <Card className="bg-card/70 backdrop-blur-sm border-primary/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary blur-3xl opacity-40 animate-pulse" />
                      <CheckCircle2 className="relative h-24 w-24 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
                      ✓ Verified Certificate
                    </Badge>
                    <h2 className="text-3xl font-bold">{result.data.profiles.full_name}</h2>
                    <p className="text-muted-foreground">
                      {result.data.organizations.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Period</p>
                      <p className="font-semibold">
                        {format(new Date(result.data.start_date), "MMM dd, yyyy")} - {format(new Date(result.data.end_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="font-semibold">{result.data.total_hours} hours</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground">Generated</p>
                      <p className="font-semibold">
                        {format(new Date(result.data.generated_at), "MMMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>

                  <Button onClick={handleReset} variant="outline" className="mt-4">
                    Verify Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {result && result.type === "member" && (
            <div className="space-y-6">
              <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">{result.data.profile.full_name}</CardTitle>
                  <CardDescription>{result.data.profile.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.data.profile.volunteer_profiles && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Level</p>
                        <p className="text-2xl font-bold text-primary">
                          Level {result.data.profile.volunteer_profiles.level}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                        <p className="text-2xl font-bold">
                          {result.data.profile.volunteer_profiles.total_hours}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Volunteer History</h3>
                {result.data.sessions.length === 0 ? (
                  <Card className="bg-card/70 backdrop-blur-sm">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No volunteer sessions recorded yet
                    </CardContent>
                  </Card>
                ) : (
                  result.data.sessions.map((session: any) => (
                    <Card key={session.id} className="bg-card/70 backdrop-blur-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              {session.organizations.logo_url && (
                                <img
                                  src={session.organizations.logo_url}
                                  alt={session.organizations.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <h4 className="font-semibold">{session.organizations.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(session.session_date), "MMMM dd, yyyy")}
                                </p>
                              </div>
                            </div>
                            {session.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {session.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="ml-4">
                            {session.hours_worked} {session.hours_worked === 1 ? "hour" : "hours"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <Button onClick={handleReset} variant="outline" className="w-full">
                Verify Another
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;
