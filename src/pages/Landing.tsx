import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Award, TrendingUp, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
const Landing = () => {
  return <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="text-xl font-bold">Quantrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Quantifying Engagement,
              </span>
              <br />
              Multiplying Impact
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Quantrack transforms how teams track participation and engagement. Monitor contributions, issue certificates, and amplify your collective impact.</p>
            <div className="flex gap-4 justify-center pt-4">
              <Link to="/signup">
                <Button variant="hero" size="xl">
                  Start Tracking
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg">Everything you need to manage your team effectively</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-card/70 backdrop-blur-sm border-border hover:border-accent transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Member Portal</h3>
              <p className="text-muted-foreground">Intuitive dashboard for team members to track contributions, view activities, and monitor their engagement.</p>
            </Card>

            <Card className="p-6 bg-card/70 backdrop-blur-sm border-border hover:border-accent transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Event Management</h3>
              <p className="text-muted-foreground">
                Create, schedule, and track events with QR code-based attendance verification.
              </p>
            </Card>

            <Card className="p-6 bg-card/70 backdrop-blur-sm border-border hover:border-accent transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certificate System</h3>
              <p className="text-muted-foreground">
                Generate and issue verified service certificates with unique verification codes.
              </p>
            </Card>

            <Card className="p-6 bg-card/70 backdrop-blur-sm border-border hover:border-accent transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gamification</h3>
              <p className="text-muted-foreground">Level-up system based on participation to motivate and recognize team contributions.</p>
            </Card>

            <Card className="p-6 bg-card/70 backdrop-blur-sm border-border hover:border-accent transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Verified</h3>
              <p className="text-muted-foreground">
                Team verification system ensures authenticity and builds trust across your organization.
              </p>
            </Card>

            <Card className="p-6 bg-card/70 backdrop-blur-sm border-border hover:border-accent transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
              <p className="text-muted-foreground">Comprehensive tools for team, event, and organization management.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="p-12 text-center bg-card/50 backdrop-blur-xl border-accent/50 shadow-glass">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Team?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">Join Quantrack today and experience the future of engagement tracking. Get started in minutes.</p>
            <Link to="/signup">
              <Button variant="premium" size="xl">
                Create Free Account
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 Quantrack. All rights reserved.</p>
        </div>
      </footer>
    </div>;
};
export default Landing;