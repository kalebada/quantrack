import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageEvents from "./pages/ManageEvents";
import ManageMembers from "./pages/ManageMembers";
import ApproveHours from "./pages/ApproveHours";
import QRAttendance from "./pages/QRAttendance";
import AssignTasks from "./pages/AssignTasks";
import Verify from "./pages/Verify";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/volunteer" element={<VolunteerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/manage-events" element={<ManageEvents />} />
          <Route path="/manage-members" element={<ManageMembers />} />
          <Route path="/approve-hours" element={<ApproveHours />} />
          <Route path="/qr-attendance" element={<QRAttendance />} />
          <Route path="/assign-tasks" element={<AssignTasks />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
