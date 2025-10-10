import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
