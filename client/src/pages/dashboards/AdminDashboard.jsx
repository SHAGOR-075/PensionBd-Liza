import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  AlertTriangle, 
  Shield, 
  FileText,
  UserX,
  UserCheck,
  TrendingUp,
  Settings
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeManagers: 0,
    disabledManagers: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    redFlagsIssued: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [flaggedManagers, setFlaggedManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, complaintsResponse, managersResponse] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/recent-complaints'),
        api.get('/api/admin/flagged-managers')
      ]);

      setStats(statsResponse.data);
      setRecentComplaints(complaintsResponse.data);
      setFlaggedManagers(managersResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplaintPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          System administration and oversight
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Managers</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeManagers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Complaints</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingComplaints}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Red Flags</p>
              <p className="text-2xl font-bold text-red-600">{stats.redFlagsIssued}</p>
            </div>
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* High Priority Alerts */}
      {(flaggedManagers.length > 0 || stats.pendingComplaints > 5) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {flaggedManagers.length > 0 && (
            <div className="card border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                High-Risk Managers
              </h3>
              <div className="space-y-3">
                {flaggedManagers.slice(0, 3).map((manager) => (
                  <div key={manager._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-900">{manager.name}</p>
                      <p className="text-sm text-red-700">{manager.redFlags} red flag(s)</p>
                    </div>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.pendingComplaints > 5 && (
            <div className="card border-yellow-200 bg-yellow-50">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Complaint Backlog Alert
              </h3>
              <p className="text-yellow-700 mb-4">
                You have {stats.pendingComplaints} pending complaints that require immediate attention.
              </p>
              <Link 
                to="/admin/complaints" 
                className="inline-flex items-center text-yellow-800 hover:text-yellow-900 font-medium"
              >
                Review Complaints →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/admin/complaints" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">Manage Complaints</h3>
              <p className="text-sm text-gray-600">Review and resolve issues</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/users" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">User Management</h3>
              <p className="text-sm text-gray-600">Manage user accounts</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">System Reports</h3>
              <p className="text-sm text-gray-600">Analytics and insights</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">System Settings</h3>
              <p className="text-sm text-gray-600">Configure system parameters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Complaints */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Complaints</h2>
            <Link to="/admin/complaints" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent complaints</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentComplaints.map((complaint) => (
                <div key={complaint._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{complaint.subject}</p>
                    <p className="text-sm text-gray-600">
                      From: {complaint.complainantName} • 
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplaintPriorityColor(complaint.priority)}`}>
                    {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Overview */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Overview</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Total Applications</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">1,234</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Approved This Month</span>
              </div>
              <span className="text-2xl font-bold text-green-600">89</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Pending Review</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">45</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserX className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">Disabled Accounts</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{stats.disabledManagers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;