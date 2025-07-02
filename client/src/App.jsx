import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import PensionHolderRegister from './pages/auth/PensionHolderRegister';
import PensionHolderDashboard from './pages/dashboards/PensionHolderDashboard';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import PensionForm from './pages/pension/PensionForm';
import ApplicationStatus from './pages/pension/ApplicationStatus';
import ComplaintForm from './pages/pension/ComplaintForm';
import ApplicationReview from './pages/manager/ApplicationReview';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import UserManagement from './pages/admin/UserManagement';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} />
          <Route path="/pension-holder/register" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <PensionHolderRegister />} />
          
          {/* Pension Holder Routes */}
          <Route path="/pension-holder/dashboard" element={
            <ProtectedRoute allowedRoles={['pension-holder']}>
              <PensionHolderDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pension-holder/form" element={
            <ProtectedRoute allowedRoles={['pension-holder']}>
              <PensionForm />
            </ProtectedRoute>
          } />
          <Route path="/pension-holder/status" element={
            <ProtectedRoute allowedRoles={['pension-holder']}>
              <ApplicationStatus />
            </ProtectedRoute>
          } />
          <Route path="/pension-holder/complaint" element={
            <ProtectedRoute allowedRoles={['pension-holder']}>
              <ComplaintForm />
            </ProtectedRoute>
          } />
          
          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/applications" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ApplicationReview />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/complaints" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ComplaintManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          
          {/* Error Routes */}
          <Route path="/unauthorized" element={
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
                <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
              </div>
            </div>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;