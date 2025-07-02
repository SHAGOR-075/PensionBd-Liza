import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  MessageSquare,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';
import api from '../../services/api';

const ApplicationReview = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/manager/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (applicationId, action, comments = '') => {
    setActionLoading(true);
    try {
      await api.put(`/api/manager/applications/${applicationId}/${action}`, {
        comments
      });
      
      // Refresh applications
      await fetchApplications();
      setSelectedApplication(null);
      setShowFeedbackModal(false);
      setFeedback('');
    } catch (error) {
      console.error(`Error ${action} application:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const openFeedbackModal = (application, type) => {
    setSelectedApplication(application);
    setActionType(type);
    setShowFeedbackModal(true);
  };

  const submitFeedback = () => {
    if (actionType === 'feedback') {
      handleAction(selectedApplication._id, 'feedback', feedback);
    } else if (actionType === 'reject') {
      handleAction(selectedApplication._id, 'reject', feedback);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'under-review':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'feedback':
        return <MessageSquare className="w-5 h-5 text-orange-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under-review':
        return 'bg-blue-100 text-blue-800';
      case 'feedback':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Application Review
        </h1>
        <p className="text-gray-600">
          Review and process pension applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-600">There are no applications to review at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div 
              key={application._id} 
              className={`card ${isOverdue(application) ? 'border-orange-200 bg-orange-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(application.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.personalInfo?.fullName || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Application #{application._id.slice(-6)} • 
                      Submitted {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                    {isOverdue(application) && (
                      <p className="text-xs text-orange-600 font-medium">
                        ⚠️ Overdue - Action Required (3+ days pending)
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Employee ID</p>
                    <p className="text-sm font-medium">{application.serviceInfo?.employeeId || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Service Years</p>
                    <p className="text-sm font-medium">{application.serviceInfo?.serviceYears || 'N/A'} years</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Last Salary</p>
                    <p className="text-sm font-medium">৳{application.serviceInfo?.lastBasicSalary?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Pension Type</p>
                    <p className="text-sm font-medium capitalize">{application.serviceInfo?.pensionType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedApplication(selectedApplication === application._id ? null : application._id)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>{selectedApplication === application._id ? 'Hide Details' : 'View Details'}</span>
                </button>

                {application.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openFeedbackModal(application, 'feedback')}
                      className="btn-secondary text-sm"
                    >
                      Request Feedback
                    </button>
                    <button
                      onClick={() => openFeedbackModal(application, 'reject')}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(application._id, 'approve')}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>

              {/* Detailed View */}
              {selectedApplication === application._id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Personal Information</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Full Name:</span>
                          <span className="text-gray-900">{application.personalInfo?.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">NID:</span>
                          <span className="text-gray-900">{application.personalInfo?.nid || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date of Birth:</span>
                          <span className="text-gray-900">
                            {application.personalInfo?.dateOfBirth ? 
                              new Date(application.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="text-gray-900">{application.personalInfo?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="text-gray-900">{application.personalInfo?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Service Information */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Service Information</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="text-gray-900">{application.serviceInfo?.department || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Designation:</span>
                          <span className="text-gray-900">{application.serviceInfo?.designation || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Joining Date:</span>
                          <span className="text-gray-900">
                            {application.serviceInfo?.joiningDate ? 
                              new Date(application.serviceInfo.joiningDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Retirement Date:</span>
                          <span className="text-gray-900">
                            {application.serviceInfo?.retirementDate ? 
                              new Date(application.serviceInfo.retirementDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bank Information */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Bank Information</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bank Name:</span>
                          <span className="text-gray-900">{application.bankInfo?.bankName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Branch:</span>
                          <span className="text-gray-900">{application.bankInfo?.branchName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Number:</span>
                          <span className="text-gray-900">{application.bankInfo?.accountNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Routing Number:</span>
                          <span className="text-gray-900">{application.bankInfo?.routingNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Nominee Information */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Nominee Information</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nominee Name:</span>
                          <span className="text-gray-900">{application.nomineeInfo?.nomineeName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Relationship:</span>
                          <span className="text-gray-900 capitalize">{application.nomineeInfo?.nomineeRelation || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nominee NID:</span>
                          <span className="text-gray-900">{application.nomineeInfo?.nomineeNid || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Circumstances */}
                  {application.specialCircumstances && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-3">Special Circumstances</h5>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {application.specialCircumstances}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {actionType === 'feedback' ? 'Request Feedback' : 'Reject Application'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {actionType === 'feedback' 
                ? 'Please specify what information or corrections are needed:'
                : 'Please provide a reason for rejection:'
              }
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="4"
              className="form-input mb-4"
              placeholder={actionType === 'feedback' 
                ? 'Describe the required changes or additional information needed...'
                : 'Explain why this application is being rejected...'
              }
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedback('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={!feedback.trim() || actionLoading}
                className={`${actionType === 'feedback' ? 'btn-primary' : 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg'} disabled:opacity-50`}
              >
                {actionLoading ? 'Processing...' : (actionType === 'feedback' ? 'Send Feedback' : 'Reject Application')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationReview;