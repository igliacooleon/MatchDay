import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from './config/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import Leagues from "./pages/Leagues";
import LeagueDetail from "./pages/LeagueDetail";
import Statistics from "./pages/Statistics";
import Upcoming from "./pages/Upcoming";
import NotFound from "./pages/NotFound";

// Create QueryClient with proper config for wagmi
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider 
        theme={darkTheme({
          accentColor: '#00D9FF',
          accentColorForeground: 'white',
          borderRadius: 'large',
        })}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/leagues" replace />} />
              <Route path="/leagues" element={<Leagues />} />
              <Route path="/league/:leagueId" element={<LeagueDetail />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
