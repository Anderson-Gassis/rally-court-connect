
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
import PartnerProfile from "./pages/PartnerProfile";
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorProfile from "./pages/InstructorProfile";
import InstructorPublicProfile from "./pages/InstructorPublicProfile";
import ResetPassword from "./pages/ResetPassword";
import Rankings from "./pages/Rankings";
import Tournaments from "./pages/Tournaments";
import CreateTournament from "./pages/CreateTournament";
import TournamentDetails from "./pages/TournamentDetails";
import FindPartner from "./pages/FindPartner";
import Instructors from "./pages/Instructors";
import BookingSuccess from "./pages/BookingSuccess";
import TournamentSuccess from "./pages/TournamentSuccess";
import AdPaymentSuccess from "./pages/AdPaymentSuccess";
import Players from "./pages/Players";
import AdminDashboard from "./pages/AdminDashboard";
import LeagueDetails from "./pages/LeagueDetails";
import Install from "./pages/Install";
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
            <Route path="/partner/profile" element={<PartnerProfile />} />
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/profile" element={<InstructorProfile />} />
            <Route path="/instructors/:id" element={<InstructorPublicProfile />} />
            <Route path="/player/dashboard" element={<PlayerDashboard />} />
            <Route path="/player/bookings" element={<PlayerDashboard />} />
            <Route path="/player/profile" element={<PlayerProfile />} />
            <Route path="/players/:id" element={<PlayerProfile />} />
            <Route path="/players" element={<Players />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/create" element={<CreateTournament />} />
            <Route path="/tournaments/:id" element={<TournamentDetails />} />
            <Route path="/find-partner" element={<FindPartner />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/tournament-success" element={<TournamentSuccess />} />
            <Route path="/ad-payment-success" element={<AdPaymentSuccess />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/leagues/:id" element={<LeagueDetails />} />
            <Route path="/install" element={<Install />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
