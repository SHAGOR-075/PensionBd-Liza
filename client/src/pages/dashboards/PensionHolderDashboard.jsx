import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Plus,
  Eye
} from 'lucide-react';
import api from '../../services/api';

const PensionHolderDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('https://pensionbd-liza.onrender.com/api/pension-holder/applications');
      setApplications(response.data);
      
      // Calculate stats
      const stats = response.data.reduce((acc, app) => {
        acc.total++;
        acc[app.status]++;
        return acc;
      }, { total: 0, pending: 0, approved: 0, rejected: 0 });
      
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

  const canApplyForPension = () => {
    if (!user.joiningDate) return false;
    
    const joiningDate = new Date(user.joiningDate);
    const currentDate = new Date();
    const serviceYears = (currentDate - joiningDate) / (1000 * 60 * 60 * 24 * 365);
    
    return serviceYears >= 19;
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
          Welcome, {user.name}
        </h1>
        <p className="text-gray-600">
          Manage your pension applications and track their status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <p className="text-sm font-medium text-gray-600">Pending</p>
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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/pension-holder/form"
          className={`card hover:shadow-md transition-shadow ${
            !canApplyForPension() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={(e) => !canApplyForPension() && e.preventDefault()}
        >
          <div className="flex items-center space-x-3">
            <Plus className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">Apply for Pension</h3>
              <p className="text-sm text-gray-600">Submit new pension application</p>
            </div>
          </div>
        </Link>

        <Link to="/pension-holder/status" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">Check Status</h3>
              <p className="text-sm text-gray-600">View application progress</p>
            </div>
          </div>
        </Link>

        <Link to="/pension-holder/complaint" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">File Complaint</h3>
              <p className="text-sm text-gray-600">Report issues or concerns</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Download className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">Download PDF</h3>
              <p className="text-sm text-gray-600">Get pension documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Years Notice */}
      {!canApplyForPension() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">Service Requirement Notice</p>
              <p>You need at least 19 years of government service to apply for pension. Please complete your service period before applying.</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
          <Link to="/pension-holder/status" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No applications found</p>
            <p className="text-sm text-gray-500 mt-1">
              {canApplyForPension() ? 'Start by submitting your first pension application' : 'Complete 19 years of service to apply'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.slice(0, 3).map((application) => (
              <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(application.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      Application #{application._id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Submitted on {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                  {application.status === 'approved' && (
                    <button className="text-primary-600 hover:text-primary-700">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PensionHolderDashboard;