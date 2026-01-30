import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Room from "@/pages/Room";
import AuthPage from "@/pages/auth-page";
import TherapistDirectory from "@/pages/TherapistDirectory";
import TherapistProfile from "@/pages/TherapistProfile";
import RecoveryDashboard from "@/pages/RecoveryDashboard";
import GroupSessions from "@/pages/GroupSessions";
import ChatSelection from "@/pages/ChatSelection";
import { SocketProvider } from "@/lib/SocketContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route"; // Ensure this exists or use logic inside components

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={Home} />
      <Route path="/room/:id" component={Room} />
      <Route path="/therapists" component={TherapistDirectory} />
      <Route path="/therapist/:id" component={TherapistProfile} />
      <Route path="/therapist/:id" component={TherapistProfile} />
      <Route path="/groups" component={GroupSessions} />
      <Route path="/chat" component={ChatSelection} />
      <Route path="/recovery" component={RecoveryDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <SocketProvider>
            <Router />
          </SocketProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
