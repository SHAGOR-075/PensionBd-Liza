import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Eye
} from 'lucide-react';
import api from '../../services/api';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/manager/applications');
      setApplications(response.data);
      
      // Calculate stats including overdue applications
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
      
      const stats = response.data.reduce((acc, app) => {
        acc.total++;
        acc[app.status]++;
        
        // Check if application is overdue (pending for more than 3 days)
        if (app.status === 'pending' && new Date(app.createdAt) < threeDaysAgo) {
          acc.overdue++;
        }
        
        return acc;
      }, { total: 0, pending: 0, approved: 0, rejected: 0, overdue: 0 });
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'feedback':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'feedback':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (application) => {
    if (application.status !== 'pending') return false;
    
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
    return new Date(application.createdAt) < threeDaysAgo;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manager Dashboard
        </h1>
        <p className="text-gray-600">
          Review and process pension applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-orange-600">{stats.overdue}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Overdue Notice */}
      {stats.overdue > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div className="text-sm text-orange-700">
              <p className="font-medium">Overdue Applications Alert</p>
              <p>You have {stats.overdue} application(s) pending for more than 3 days. Please review them immediately to avoid automatic escalation.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/manager/applications" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">Review Applications</h3>
              <p className="text-sm text-gray-600">Process pending applications</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">Performance Report</h3>
              <p className="text-sm text-gray-600">View processing statistics</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">Applicant Directory</h3>
              <p className="text-sm text-gray-600">Search pension holders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
          <Link to="/manager/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No applications found</p>
            <p className="text-sm text-gray-500 mt-1">New applications will appear here for review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.slice(0, 5).map((application) => (
              <div 
                key={application._id} 
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  isOverdue(application) ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(application.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {application.pensionHolderName || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Application #{application._id.slice(-6)} • 
                      Submitted {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                    {isOverdue(application) && (
                      <p className="text-xs text-orange-600 font-medium">Overdue - Action Required</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                  <Link 
                    to={`/manager/applications?id=${application._id}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;