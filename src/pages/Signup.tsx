import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background py-12">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="text-2xl font-bold">Quantrack</span>
          </Link>
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground">Join Quantrack and start tracking team engagement</p>
        </div>

        <Card className="p-6 bg-card/70 backdrop-blur-xl border-border shadow-glass">
          <Tabs defaultValue="volunteer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="volunteer">Member</TabsTrigger>
              <TabsTrigger value="organization">Team Admin</TabsTrigger>
            </TabsList>

            {/* Member Signup */}
            <TabsContent value="volunteer" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volunteer-firstname">First Name</Label>
                  <Input id="volunteer-firstname" placeholder="John" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volunteer-lastname">Last Name</Label>
                  <Input id="volunteer-lastname" placeholder="Doe" className="bg-background" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteer-dob">Date of Birth</Label>
                <Input id="volunteer-dob" type="date" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteer-school">School/Organization</Label>
                <Input id="volunteer-school" placeholder="School Name" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteer-email">Email</Label>
                <Input
                  id="volunteer-email"
                  type="email"
                  placeholder="john@example.com"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteer-password">Password</Label>
                <Input
                  id="volunteer-password"
                  type="password"
                  placeholder="Create a password"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization-code">Team Code (Optional)</Label>
                <Input
                  id="organization-code"
                  placeholder="Enter code to join a team"
                  className="bg-background"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="volunteer-terms" />
                <Label htmlFor="volunteer-terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the Terms & Conditions and Privacy Policy
                </Label>
              </div>

              <Button className="w-full" variant="hero" size="lg">
                Create Account
              </Button>
            </TabsContent>

            {/* Team Admin Signup */}
            <TabsContent value="organization" className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Team Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="org-name">Team Name</Label>
                  <Input id="org-name" placeholder="Your Team Name" className="bg-background" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-established">Date Founded</Label>
                    <Input id="org-established" type="date" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-regno">Registration Number (Optional)</Label>
                    <Input id="org-regno" placeholder="e.g., 123456789" className="bg-background" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-type">Team Type</Label>
                  <Input id="org-type" placeholder="e.g., Nonprofit, Sports Team, Club" className="bg-background" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-website">Official Website</Label>
                  <Input id="org-website" placeholder="https://yourorg.com" className="bg-background" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-mission">Mission Statement</Label>
                  <Input
                    id="org-mission"
                    placeholder="Brief description of your mission"
                    className="bg-background"
                  />
                </div>

                <h3 className="font-semibold text-lg pt-4">Admin Details</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-firstname">Admin First Name</Label>
                    <Input id="admin-firstname" placeholder="Jane" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-lastname">Admin Last Name</Label>
                    <Input id="admin-lastname" placeholder="Smith" className="bg-background" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@yourorg.com"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-phone">Phone Number</Label>
                  <Input id="admin-phone" placeholder="+1 (555) 000-0000" className="bg-background" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-title">Job Title/Position</Label>
                  <Input id="admin-title" placeholder="Executive Director" className="bg-background" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Create a password"
                    className="bg-background"
                  />
                </div>

                <h3 className="font-semibold text-lg pt-4">Location</h3>

                <div className="space-y-2">
                  <Label htmlFor="org-address">Registered Address</Label>
                  <Input id="org-address" placeholder="123 Main Street" className="bg-background" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-city">City</Label>
                    <Input id="org-city" placeholder="New York" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-country">Country</Label>
                    <Input id="org-country" placeholder="United States" className="bg-background" />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="org-terms" />
                    <Label htmlFor="org-terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the Terms & Conditions and Data Usage Policy
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="org-accuracy" />
                    <Label htmlFor="org-accuracy" className="text-sm text-muted-foreground cursor-pointer">
                      I confirm that all information provided is accurate
                    </Label>
                  </div>
                </div>

                <Button className="w-full" variant="glass" size="lg">
                  Register Team
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
