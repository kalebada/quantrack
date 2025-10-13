import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Task {
  id: string;
  title: string;
  description: string;
  estimated_hours: number;
  due_date: string;
  status: string;
  assignment_status: string;
  assignment_id: string;
}

export const TasksCard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's role and organizations
      const { data: memberships } = await supabase
        .from("organization_members")
        .select("organization_id, member_role")
        .eq("volunteer_id", user.id);

      if (!memberships || memberships.length === 0) {
        setLoading(false);
        return;
      }

      const orgIds = memberships.map((m) => m.organization_id);
      const userRole = memberships[0]?.member_role;

      // Fetch tasks assigned to user or their role
      const { data: assignmentsData } = await supabase
        .from("task_assignments")
        .select(`
          id,
          status,
          tasks!inner(
            id,
            title,
            description,
            estimated_hours,
            due_date,
            status,
            organization_id
          )
        `)
        .or(`volunteer_id.eq.${user.id},role.eq.${userRole}`)
        .in("tasks.organization_id", orgIds)
        .eq("tasks.status", "active");

      if (assignmentsData) {
        const formattedTasks = assignmentsData.map((assignment: any) => ({
          id: assignment.tasks.id,
          title: assignment.tasks.title,
          description: assignment.tasks.description,
          estimated_hours: assignment.tasks.estimated_hours,
          due_date: assignment.tasks.due_date,
          status: assignment.tasks.status,
          assignment_status: assignment.status,
          assignment_id: assignment.id,
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (assignmentId: string) => {
    try {
      await supabase
        .from("task_assignments")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", assignmentId);

      toast({ title: "Success", description: "Task marked as completed" });
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      toast({ title: "Error", description: "Failed to complete task", variant: "destructive" });
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const pendingTasks = tasks.filter((t) => t.assignment_status === "pending");
  const completedTasks = tasks.filter((t) => t.assignment_status === "completed");

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <p className="text-muted-foreground text-center">Loading tasks...</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">My Tasks</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{pendingTasks.length} pending</span>
          </div>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No pending tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const overdue = isOverdue(task.due_date);
              return (
                <div
                  key={task.id}
                  className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{task.title}</h4>
                    {overdue && (
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimated_hours}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className={overdue ? "text-destructive" : ""}>
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Completed: {completedTasks.length}
            </p>
          </div>
        )}
      </Card>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{selectedTask?.description || "No description provided"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-1">Estimated Hours</h4>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{selectedTask?.estimated_hours}h</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Due Date</h4>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedTask ? new Date(selectedTask.due_date).toLocaleDateString() : ""}</span>
                </div>
              </div>
            </div>

            {selectedTask?.assignment_status === "pending" && (
              <Button
                onClick={() => handleCompleteTask(selectedTask.assignment_id)}
                className="w-full"
                size="lg"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Mark as Complete
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
