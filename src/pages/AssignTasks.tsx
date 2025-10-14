import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Clock, Calendar, Users, CheckCircle2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/logo.svg";

interface Task {
  id: string;
  title: string;
  description: string;
  estimated_hours: number;
  due_date: string;
  status: string;
  created_at: string;
  assignments: { volunteer_id?: string; role?: string; status: string }[];
}

interface Member {
  id: string;
  full_name: string;
  member_role: string;
}

const AssignTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>("");
  const { toast } = useToast();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    estimated_hours: 1,
    due_date: "",
    assign_to: "role" as "role" | "specific",
    selected_role: "volunteer",
    selected_members: [] as string[],
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get admin's organization
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!adminProfile) return;
      setOrganizationId(adminProfile.organization_id);

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from("tasks")
        .select(`
          *,
          task_assignments(volunteer_id, role, status)
        `)
        .eq("organization_id", adminProfile.organization_id)
        .order("created_at", { ascending: false });

      if (tasksData) {
        const formattedTasks = tasksData.map((task: any) => ({
          ...task,
          assignments: task.task_assignments || [],
        }));
        setTasks(formattedTasks);
      }

      // Fetch organization members
      const { data: membersData } = await supabase
        .from("organization_members")
        .select("volunteer_id, member_role, profiles!organization_members_volunteer_id_fkey(id, full_name)")
        .eq("organization_id", adminProfile.organization_id);

      if (membersData) {
        const formattedMembers = membersData.map((m: any) => ({
          id: m.profiles.id,
          full_name: m.profiles.full_name,
          member_role: m.member_role,
        }));
        setMembers(formattedMembers);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching data:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.due_date) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create task
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .insert({
          organization_id: organizationId,
          title: newTask.title,
          description: newTask.description,
          estimated_hours: newTask.estimated_hours,
          due_date: newTask.due_date,
          created_by: user.id,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Create assignments
      if (newTask.assign_to === "role") {
        await supabase.from("task_assignments").insert({
          task_id: taskData.id,
          role: newTask.selected_role,
        });
      } else {
        const assignments = newTask.selected_members.map((memberId) => ({
          task_id: taskData.id,
          volunteer_id: memberId,
        }));
        await supabase.from("task_assignments").insert(assignments);
      }

      toast({ title: "Success", description: "Task created successfully" });
      setShowCreateDialog(false);
      setNewTask({
        title: "",
        description: "",
        estimated_hours: 1,
        due_date: "",
        assign_to: "role",
        selected_role: "volunteer",
        selected_members: [],
      });
      fetchAdminData();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error creating task:", error);
      }
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await supabase.from("tasks").delete().eq("id", taskId);
      toast({ title: "Success", description: "Task deleted successfully" });
      fetchAdminData();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error deleting task:", error);
      }
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    }
  };

  const handleToggleMember = (memberId: string) => {
    setNewTask((prev) => ({
      ...prev,
      selected_members: prev.selected_members.includes(memberId)
        ? prev.selected_members.filter((id) => id !== memberId)
        : [...prev.selected_members, memberId],
    }));
  };

  const activeTasks = tasks.filter((t) => t.status === "active");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-1">
              <img src={logo} alt="Quantrack Logo" className="h-8 w-8" />
              <span className="text-xl font-bold">Quantrack Admin</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Task Management</h1>
            <p className="text-muted-foreground">Create and assign tasks to volunteers</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Describe the task"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hours">Estimated Hours *</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="1"
                      value={newTask.estimated_hours}
                      onChange={(e) => setNewTask({ ...newTask, estimated_hours: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Due Date *</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Assign To</Label>
                  <Select
                    value={newTask.assign_to}
                    onValueChange={(value: "role" | "specific") => setNewTask({ ...newTask, assign_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="role">By Role</SelectItem>
                      <SelectItem value="specific">Specific Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newTask.assign_to === "role" ? (
                  <div>
                    <Label>Select Role</Label>
                    <Select
                      value={newTask.selected_role}
                      onValueChange={(value) => setNewTask({ ...newTask, selected_role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volunteer">All Volunteers</SelectItem>
                        <SelectItem value="leader">Leaders</SelectItem>
                        <SelectItem value="coordinator">Coordinators</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label>Select Members</Label>
                    <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={member.id}
                            checked={newTask.selected_members.includes(member.id)}
                            onCheckedChange={() => handleToggleMember(member.id)}
                          />
                          <label htmlFor={member.id} className="text-sm cursor-pointer">
                            {member.full_name} ({member.member_role})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleCreateTask} className="w-full" size="lg">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.reduce((sum, t) => sum + t.estimated_hours, 0)}h
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Tasks */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Active Tasks</h2>
          <div className="space-y-4">
            {loading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading tasks...</p>
              </Card>
            ) : activeTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No active tasks</p>
              </Card>
            ) : (
              activeTasks.map((task) => (
                <Card key={task.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                      <p className="text-muted-foreground mb-4">{task.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{task.estimated_hours} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{task.assignments?.length || 0} assigned</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Completed Tasks</h2>
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <Card key={task.id} className="p-6 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                      <p className="text-muted-foreground mb-4">{task.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{task.estimated_hours} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignTasks;
