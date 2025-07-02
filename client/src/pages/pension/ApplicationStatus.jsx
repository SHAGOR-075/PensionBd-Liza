import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Eye,
  MessageSquare
} from 'lucide-react';
import api from '../../services/api';

const ApplicationStatus = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/pension-holder/applications');
      setApplications(response.data);
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

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending':
        return 'Your application is waiting for initial review';
      case 'under-review':
        return 'Your application is being reviewed by the manager';
      case 'feedback':
        return 'Additional information or corrections are required';
      case 'approved':
        return 'Your pension application has been approved';
      case 'rejected':
        return 'Your application has been rejected';
      default:
        return 'Status unknown';
    }
  };

  const downloadPDF = async (applicationId) => {
    try {
      const response = await api.get(`/api/pension-holder/applications/${applicationId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pension-application-${applicationId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Application Status
        </h1>
        <p className="text-gray-600">
          Track the progress of your pension applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-600 mb-6">You haven't submitted any pension applications yet.</p>
          <a href="/pension-holder/form" className="btn-primary">
            Apply for Pension
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(application.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Application #{application._id.slice(-6)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Submitted on {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">{getStatusDescription(application.status)}</p>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pension Type</p>
                  <p className="text-gray-900 capitalize">{application.serviceInfo?.pensionType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Service Years</p>
                  <p className="text-gray-900">{application.serviceInfo?.serviceYears || 'N/A'} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-gray-900">{new Date(application.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Feedback Section */}
              {application.feedback && application.feedback.length > 0 && (
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Feedback Required
                  </h4>
                  <div className="space-y-2">
                    {application.feedback.map((feedback, index) => (
                      <div key={index} className="text-sm text-orange-700">
                        <p className="font-medium">{feedback.field && `${feedback.field}: `}{feedback.message}</p>
                        <p className="text-xs text-orange-600">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pension Details (for approved applications) */}
              {application.status === 'approved' && application.pensionDetails && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-3">Pension Calculation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-green-700">Monthly Pension</p>
                      <p className="text-lg font-bold text-green-900">
                        ৳{application.pensionDetails.monthlyPension?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">Gratuity</p>
                      <p className="text-lg font-bold text-green-900">
                        ৳{application.pensionDetails.gratuity?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">Provident Fund</p>
                      <p className="text-lg font-bold text-green-900">
                        ৳{application.pensionDetails.providentFund?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {application.status === 'rejected' && application.reviewComments && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Rejection Reason</h4>
                  <p className="text-sm text-red-700">{application.reviewComments}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedApplication(selectedApplication === application._id ? null : application._id)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{selectedApplication === application._id ? 'Hide Details' : 'View Details'}</span>
                  </button>
                </div>

                {application.status === 'approved' && (
                  <button
                    onClick={() => downloadPDF(application._id)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                )}
              </div>

              {/* Detailed View */}
              {selectedApplication === application._id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Personal Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Full Name:</span>
                          <span className="text-gray-900">{application.personalInfo?.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">NID:</span>
                          <span className="text-gray-900">{application.personalInfo?.nid || 'N/A'}</span>
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

                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Service Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employee ID:</span>
                          <span className="text-gray-900">{application.serviceInfo?.employeeId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="text-gray-900">{application.serviceInfo?.department || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Designation:</span>
                          <span className="text-gray-900">{application.serviceInfo?.designation || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Salary:</span>
                          <span className="text-gray-900">৳{application.serviceInfo?.lastBasicSalary?.toLocaleString() || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;