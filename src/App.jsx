import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AuthorCredit from '@/components/AuthorCredit';
// Add page imports here
import Home from './pages/Home';
import TeamFormation from './pages/TeamFormation';
import AgentCollaboration from './pages/AgentCollaboration';
import Dashboard from './pages/Dashboard';
import LearningLoop from './pages/LearningLoop';
import EmployeeGrowth from './pages/EmployeeGrowth';
import EmployeeCenter from './pages/EmployeeCenter';
import CreateEmployee from './pages/CreateEmployee';
import EmployeeDetail from './pages/EmployeeDetail';
import KnowledgeBrain from './pages/KnowledgeBrain';
import ProjectManagement from './pages/ProjectManagement';
import ProjectDetail from './pages/ProjectDetail';
import WorkflowLayout from './components/WorkflowLayout';

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
      {/* Add your page Route elements here */}
      <Route path="/" element={<Home />} />
      <Route path="/knowledge" element={<KnowledgeBrain />} />
      <Route path="/projects" element={<ProjectManagement />} />
      <Route path="/projects/:projectId" element={<ProjectDetail />} />
      <Route element={<WorkflowLayout />}>
        <Route path="/team/:projectId" element={<TeamFormation />} />
        <Route path="/collaboration/:projectId" element={<AgentCollaboration />} />
        <Route path="/dashboard/:projectId" element={<Dashboard />} />
        <Route path="/learning/:projectId" element={<LearningLoop />} />
        <Route path="/growth/:projectId" element={<EmployeeGrowth />} />
        <Route path="/employees" element={<EmployeeCenter />} />
        <Route path="/employees/create" element={<CreateEmployee />} />
        <Route path="/employees/:employeeId" element={<EmployeeDetail />} />
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
          <ScrollToTop />
          <AuthenticatedApp />
          <AuthorCredit />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App