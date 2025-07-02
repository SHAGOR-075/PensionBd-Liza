import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Shield,
  User,
  Calendar,
  Flag
} from 'lucide-react';
import api from '../../services/api';

const ComplaintManagement = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({
    resolution: '',
    issueRedFlag: false,
    redFlagReason: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/api/admin/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (complaintId, action) => {
    setActionLoading(true);
    try {
      await api.put(`/api/admin/complaints/${complaintId}/${action}`, actionData);
      
      // Refresh complaints
      await fetchComplaints();
      setShowActionModal(false);
      setActionData({ resolution: '', issueRedFlag: false, redFlagReason: '' });
    } catch (error) {
      console.error(`Error ${action} complaint:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (complaint, type) => {
    setSelectedComplaint(complaint);
    setActionType(type);
    setShowActionModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'under-investigation':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'escalated':
        return <Flag className="w-5 h-5 text-purple-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'under-investigation':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-red-100 text-red-800';
      case 'escalated':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complaint Management
        </h1>
        <p className="text-gray-600">
          Review and resolve pension holder complaints
        </p>
      </div>

      {complaints.length === 0 ? (
        <div className="card text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
          <p className="text-gray-600">There are no complaints to review at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(complaint.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {complaint.subject}
                    </h3>
                    <p className="text-sm text-gray-600">
                      From: {complaint.complainantName || 'N/A'} • 
                      Submitted {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Category</p>
                    <p className="text-sm font-medium capitalize">{complaint.category?.replace('-', ' ') || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Days Since Submission</p>
                    <p className="text-sm font-medium">{complaint.daysSinceSubmission || 0} days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Target Manager</p>
                    <p className="text-sm font-medium">{complaint.targetManagerName || 'General'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-gray-700 text-sm">{complaint.description}</p>
              </div>

              {/* Red Flag Notice */}
              {complaint.redFlagIssued && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">Red Flag Issued</span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">{complaint.redFlagReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedComplaint(selectedComplaint === complaint._id ? null : complaint._id)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>{selectedComplaint === complaint._id ? 'Hide Details' : 'View Details'}</span>
                </button>

                {(complaint.status === 'submitted' || complaint.status === 'under-investigation') && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openActionModal(complaint, 'dismiss')}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => openActionModal(complaint, 'resolve')}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>

              {/* Detailed View */}
              {selectedComplaint === complaint._id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Complaint Details */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Complaint Details</h5>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-600">Related Application:</span>
                          <span className="text-gray-900 ml-2">{complaint.relatedApplication || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Escalation Level:</span>
                          <span className="text-gray-900 ml-2">{complaint.escalationLevel || 0}</span>
                        </div>
                        {complaint.investigationNotes && (
                          <div>
                            <span className="text-gray-600">Investigation Notes:</span>
                            <p className="text-gray-900 mt-1 p-2 bg-gray-50 rounded">{complaint.investigationNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resolution Details */}
                    {(complaint.status === 'resolved' || complaint.status === 'dismissed') && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Resolution</h5>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-gray-600">Resolved By:</span>
                            <span className="text-gray-900 ml-2">{complaint.resolvedByName || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Resolution Date:</span>
                            <span className="text-gray-900 ml-2">
                              {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          {complaint.resolution && (
                            <div>
                              <span className="text-gray-600">Resolution:</span>
                              <p className="text-gray-900 mt-1 p-2 bg-gray-50 rounded">{complaint.resolution}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Communications */}
                  {complaint.communications && complaint.communications.length > 0 && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-3">Communications</h5>
                      <div className="space-y-3">
                        {complaint.communications.map((comm, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-900">{comm.senderName || 'Unknown'}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comm.sentAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comm.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {actionType === 'resolve' ? 'Resolve Complaint' : 'Dismiss Complaint'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">
                  {actionType === 'resolve' ? 'Resolution Details' : 'Dismissal Reason'}
                </label>
                <textarea
                  value={actionData.resolution}
                  onChange={(e) => setActionData({ ...actionData, resolution: e.target.value })}
                  rows="4"
                  className="form-input"
                  placeholder={actionType === 'resolve' 
                    ? 'Describe how the complaint was resolved...'
                    : 'Explain why this complaint is being dismissed...'
                  }
                />
              </div>

              {actionType === 'resolve' && selectedComplaint?.targetManager && (
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={actionData.issueRedFlag}
                      onChange={(e) => setActionData({ ...actionData, issueRedFlag: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Issue Red Flag to Manager</span>
                  </label>
                  
                  {actionData.issueRedFlag && (
                    <div className="mt-2">
                      <label className="form-label">Red Flag Reason</label>
                      <textarea
                        value={actionData.redFlagReason}
                        onChange={(e) => setActionData({ ...actionData, redFlagReason: e.target.value })}
                        rows="2"
                        className="form-input"
                        placeholder="Reason for issuing red flag..."
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setActionData({ resolution: '', issueRedFlag: false, redFlagReason: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(selectedComplaint._id, actionType)}
                disabled={!actionData.resolution.trim() || actionLoading}
                className={`${actionType === 'resolve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50`}
              >
                {actionLoading ? 'Processing...' : (actionType === 'resolve' ? 'Resolve' : 'Dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;