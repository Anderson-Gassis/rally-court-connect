
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Courts from "./pages/Courts";
import AddCourt from "./pages/AddCourt";
import PlayerProfile from "./pages/PlayerProfile";
import Rankings from "./pages/Rankings";
import Tournaments from "./pages/Tournaments";
import Instructors from "./pages/Instructors";
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
            <Route path="/players/:id" element={<PlayerProfile />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/instructors" element={<Instructors />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
