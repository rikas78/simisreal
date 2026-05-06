import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Races from './pages/Races';
import Standings from './pages/Standings';
import Pilots from './pages/Pilots';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import Complaints from './pages/Complaints';
import Admin from './pages/Admin';
import RaceDetail from './pages/RaceDetail';
import PilotProfile from './pages/PilotProfile';
import Messages from './pages/Messages';
import Calendar from './pages/Calendar';
import Streamwall from './pages/Streamwall';
import ConnectionTest from './pages/ConnectionTest';
import SetupMacchine from './pages/SetupMacchine';
import Governance from './pages/Governance';
import Announcements from './pages/Announcements';
import Career from './pages/Career';
import DisputeCenter from './pages/DisputeCenter';
import WorldRanking from './pages/WorldRanking';
import Wallet from './pages/Wallet';
import WalletMovimenti from './pages/WalletMovimenti';
import WalletRicarica from './pages/WalletRicarica';
import WalletPrelievo from './pages/WalletPrelievo';
import KYC from './pages/KYC';
import AdminEscrow from './pages/AdminEscrow';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/races" element={<Races />} />
        <Route path="/races/:id" element={<RaceDetail />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/pilots" element={<Pilots />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/pilots/:id" element={<PilotProfile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/streamwall" element={<Streamwall />} />
        <Route path="/connection-test" element={<ConnectionTest />} />
        <Route path="/setup" element={<SetupMacchine />} />
        <Route path="/governance" element={<Governance />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/career" element={<Career />} />
        <Route path="/disputes" element={<DisputeCenter />} />
        <Route path="/world-ranking" element={<WorldRanking />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/wallet/movimenti" element={<WalletMovimenti />} />
        <Route path="/wallet/ricarica" element={<WalletRicarica />} />
        <Route path="/wallet/prelievo" element={<WalletPrelievo />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="/admin/escrow" element={<AdminEscrow />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App