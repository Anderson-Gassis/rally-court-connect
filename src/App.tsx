
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Courts from "./pages/Courts";
import AddCourt from "./pages/AddCourt";
import PartnerDashboard from "./pages/PartnerDashboard";
import PlayerDashboard from "./pages/PlayerDashboard";
import PlayerProfile from "./pages/PlayerProfile";
import Rankings from "./pages/Rankings";
import Tournaments from "./pages/Tournaments";
import Instructors from "./pages/Instructors";
import BookingSuccess from "./pages/BookingSuccess";
import TournamentSuccess from "./pages/TournamentSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courts" element={<Courts />} />
            <Route path="/add-court" element={<AddCourt />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/player/dashboard" element={<PlayerDashboard />} />
            <Route path="/players/:id" element={<PlayerProfile />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/tournament-success" element={<TournamentSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
