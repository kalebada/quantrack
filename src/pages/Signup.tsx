import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { memberSignupSchema, teamAdminSignupSchema } from "@/lib/validations";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Member form state
  const [memberForm, setMemberForm] = useState({
    firstName: "", lastName: "", dateOfBirth: "", school: "",
    email: "", password: "", teamCode: "", terms: false
  });

  // Team admin form state
  const [adminForm, setAdminForm] = useState({
    orgName: "", established: "", regNo: "", orgType: "", website: "",
    mission: "", adminFirstName: "", adminLastName: "", adminEmail: "",
    adminPhone: "", adminTitle: "", password: "", address: "", city: "",
    country: "", terms: false, accuracy: false
  });

  const handleMemberSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = memberSignupSchema.parse(memberForm);
      
      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: `${validated.firstName} ${validated.lastName}`,
            role: "volunteer",
            date_of_birth: validated.dateOfBirth,
            school_organization: validated.school,
            team_code: validated.teamCode
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "You can now sign in to your account.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = teamAdminSignupSchema.parse(adminForm);
      
      const { error } = await supabase.auth.signUp({
        email: validated.adminEmail,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: `${validated.adminFirstName} ${validated.adminLastName}`,
            role: "admin",
            organization_name: validated.orgName,
            organization_type: validated.orgType,
            established_date: validated.established,
            registration_number: validated.regNo,
            website: validated.website,
            mission_statement: validated.mission,
            phone_number: validated.adminPhone,
            job_title: validated.adminTitle,
            address: validated.address,
            city: validated.city,
            country: validated.country
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Team registered!",
        description: "You can now sign in to your admin account.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/signup`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Could not sign up with Google.",
        variant: "destructive",
      });
    }
  };

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
              <form onSubmit={handleMemberSignup} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="volunteer-firstname">First Name</Label>
                    <Input 
                      id="volunteer-firstname" 
                      placeholder="John" 
                      className="bg-background"
                      value={memberForm.firstName}
                      onChange={(e) => setMemberForm({...memberForm, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="volunteer-lastname">Last Name</Label>
                    <Input 
                      id="volunteer-lastname" 
                      placeholder="Doe" 
                      className="bg-background"
                      value={memberForm.lastName}
                      onChange={(e) => setMemberForm({...memberForm, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteer-dob">Date of Birth</Label>
                  <Input 
                    id="volunteer-dob" 
                    type="date" 
                    className="bg-background"
                    value={memberForm.dateOfBirth}
                    onChange={(e) => setMemberForm({...memberForm, dateOfBirth: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteer-school">School/Organization</Label>
                  <Input 
                    id="volunteer-school" 
                    placeholder="School Name" 
                    className="bg-background"
                    value={memberForm.school}
                    onChange={(e) => setMemberForm({...memberForm, school: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteer-email">Email</Label>
                  <Input
                    id="volunteer-email"
                    type="email"
                    placeholder="john@example.com"
                    className="bg-background"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteer-password">Password</Label>
                  <Input
                    id="volunteer-password"
                    type="password"
                    placeholder="Create a password (min 8 characters)"
                    className="bg-background"
                    value={memberForm.password}
                    onChange={(e) => setMemberForm({...memberForm, password: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization-code">Team Code (Optional)</Label>
                  <Input
                    id="organization-code"
                    placeholder="Enter code to join a team"
                    className="bg-background"
                    value={memberForm.teamCode}
                    onChange={(e) => setMemberForm({...memberForm, teamCode: e.target.value})}
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="volunteer-terms"
                    checked={memberForm.terms}
                    onCheckedChange={(checked) => setMemberForm({...memberForm, terms: checked as boolean})}
                  />
                  <Label htmlFor="volunteer-terms" className="text-sm text-muted-foreground cursor-pointer">
                    I agree to the Terms & Conditions and Privacy Policy
                  </Label>
                </div>

                <Button className="w-full" variant="hero" size="lg" type="submit" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignup}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </Button>
            </TabsContent>

            {/* Team Admin Signup */}
            <TabsContent value="organization" className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <form onSubmit={handleAdminSignup} className="space-y-4">
                <h3 className="font-semibold text-lg">Team Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="org-name">Team Name</Label>
                  <Input 
                    id="org-name" 
                    placeholder="Your Team Name" 
                    className="bg-background"
                    value={adminForm.orgName}
                    onChange={(e) => setAdminForm({...adminForm, orgName: e.target.value})}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-established">Date Founded</Label>
                    <Input 
                      id="org-established" 
                      type="date" 
                      className="bg-background"
                      value={adminForm.established}
                      onChange={(e) => setAdminForm({...adminForm, established: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-regno">Registration Number (Optional)</Label>
                    <Input 
                      id="org-regno" 
                      placeholder="e.g., 123456789" 
                      className="bg-background"
                      value={adminForm.regNo}
                      onChange={(e) => setAdminForm({...adminForm, regNo: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-type">Team Type</Label>
                  <Input 
                    id="org-type" 
                    placeholder="e.g., Nonprofit, Sports Team, Club" 
                    className="bg-background"
                    value={adminForm.orgType}
                    onChange={(e) => setAdminForm({...adminForm, orgType: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-website">Official Website (Optional)</Label>
                  <Input 
                    id="org-website" 
                    placeholder="https://yourorg.com" 
                    className="bg-background"
                    value={adminForm.website}
                    onChange={(e) => setAdminForm({...adminForm, website: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-mission">Mission Statement (Optional)</Label>
                  <Input
                    id="org-mission"
                    placeholder="Brief description of your mission"
                    className="bg-background"
                    value={adminForm.mission}
                    onChange={(e) => setAdminForm({...adminForm, mission: e.target.value})}
                  />
                </div>

                <h3 className="font-semibold text-lg pt-4">Admin Details</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-firstname">Admin First Name</Label>
                    <Input 
                      id="admin-firstname" 
                      placeholder="Jane" 
                      className="bg-background"
                      value={adminForm.adminFirstName}
                      onChange={(e) => setAdminForm({...adminForm, adminFirstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-lastname">Admin Last Name</Label>
                    <Input 
                      id="admin-lastname" 
                      placeholder="Smith" 
                      className="bg-background"
                      value={adminForm.adminLastName}
                      onChange={(e) => setAdminForm({...adminForm, adminLastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@yourorg.com"
                    className="bg-background"
                    value={adminForm.adminEmail}
                    onChange={(e) => setAdminForm({...adminForm, adminEmail: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-phone">Phone Number</Label>
                  <Input 
                    id="admin-phone" 
                    placeholder="+1 (555) 000-0000" 
                    className="bg-background"
                    value={adminForm.adminPhone}
                    onChange={(e) => setAdminForm({...adminForm, adminPhone: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-title">Job Title/Position</Label>
                  <Input 
                    id="admin-title" 
                    placeholder="Executive Director" 
                    className="bg-background"
                    value={adminForm.adminTitle}
                    onChange={(e) => setAdminForm({...adminForm, adminTitle: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Create a password (min 8 characters)"
                    className="bg-background"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    required
                  />
                </div>

                <h3 className="font-semibold text-lg pt-4">Location</h3>

                <div className="space-y-2">
                  <Label htmlFor="org-address">Registered Address</Label>
                  <Input 
                    id="org-address" 
                    placeholder="123 Main Street" 
                    className="bg-background"
                    value={adminForm.address}
                    onChange={(e) => setAdminForm({...adminForm, address: e.target.value})}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-city">City</Label>
                    <Input 
                      id="org-city" 
                      placeholder="New York" 
                      className="bg-background"
                      value={adminForm.city}
                      onChange={(e) => setAdminForm({...adminForm, city: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-country">Country</Label>
                    <Input 
                      id="org-country" 
                      placeholder="United States" 
                      className="bg-background"
                      value={adminForm.country}
                      onChange={(e) => setAdminForm({...adminForm, country: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="org-terms"
                      checked={adminForm.terms}
                      onCheckedChange={(checked) => setAdminForm({...adminForm, terms: checked as boolean})}
                    />
                    <Label htmlFor="org-terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the Terms & Conditions and Data Usage Policy
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="org-accuracy"
                      checked={adminForm.accuracy}
                      onCheckedChange={(checked) => setAdminForm({...adminForm, accuracy: checked as boolean})}
                    />
                    <Label htmlFor="org-accuracy" className="text-sm text-muted-foreground cursor-pointer">
                      I confirm that all information provided is accurate
                    </Label>
                  </div>
                </div>

                <Button className="w-full" variant="glass" size="lg" type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register Team"}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignup}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </Button>
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
