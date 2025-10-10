import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="text-2xl font-bold">Quantrack</span>
          </Link>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card className="p-6 bg-card/70 backdrop-blur-xl border-border shadow-glass">
          <Tabs defaultValue="volunteer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="volunteer">Member</TabsTrigger>
              <TabsTrigger value="admin">Team Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="volunteer" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="volunteer-email">Email</Label>
                <Input
                  id="volunteer-email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volunteer-password">Password</Label>
                <Input
                  id="volunteer-password"
                  type="password"
                  placeholder="Enter your password"
                  className="bg-background"
                />
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button className="w-full" variant="hero" size="lg">
                Sign In
              </Button>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="Enter team admin email"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter your password"
                  className="bg-background"
                />
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button className="w-full" variant="hero" size="lg">
                Sign In
              </Button>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
