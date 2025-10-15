import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface RoleManagementProps {
  organizationId: string;
  onRolesChange?: () => void;
}

export const RoleManagement = ({ organizationId, onRolesChange }: RoleManagementProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchRoles();
  }, [organizationId]);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("organization_roles")
        .select("*")
        .eq("organization_id", organizationId)
        .order("name");

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching roles:", error);
      }
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, description: role.description || "" });
    } else {
      setEditingRole(null);
      setFormData({ name: "", description: "" });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingRole(null);
    setFormData({ name: "", description: "" });
  };

  const handleSaveRole = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingRole) {
        // Update existing role
        const { error } = await supabase
          .from("organization_roles")
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
          })
          .eq("id", editingRole.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      } else {
        // Create new role
        const { error } = await supabase
          .from("organization_roles")
          .insert({
            organization_id: organizationId,
            name: formData.name.trim(),
            description: formData.description.trim() || null,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Role created successfully",
        });
      }

      await fetchRoles();
      onRolesChange?.();
      handleCloseDialog();
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error saving role:", error);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to save role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRole) return;

    try {
      const { error } = await supabase
        .from("organization_roles")
        .delete()
        .eq("id", deleteRole.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role deleted successfully",
      });

      await fetchRoles();
      onRolesChange?.();
      setDeleteRole(null);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error deleting role:", error);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Role Management
              </CardTitle>
              <CardDescription>
                Create and manage custom roles for your organization
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              New Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Custom Roles</h3>
              <p className="text-muted-foreground mb-4">
                Create roles to organize your members and control event visibility
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Role
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{role.name}</Badge>
                    </div>
                    {role.description && (
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(role)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteRole(role)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Role Dialog */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Create New Role"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update the role name and description"
                : "Create a custom role for your organization"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="role-name">Role Name *</Label>
              <Input
                id="role-name"
                placeholder="e.g., Event Lead, Team Captain"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Describe the role's responsibilities..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>
              {editingRole ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRole} onOpenChange={() => setDeleteRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{deleteRole?.name}"? This will remove all
              member assignments for this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
