import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const ComplaintForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    relatedApplication: '',
    targetManager: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { value: 'application-delay', label: 'Application Processing Delay' },
    { value: 'incorrect-processing', label: 'Incorrect Processing' },
    { value: 'manager-misconduct', label: 'Manager Misconduct' },
    { value: 'system-issue', label: 'System Technical Issue' },
    { value: 'documentation-problem', label: 'Documentation Problem' },
    { value: 'payment-issue', label: 'Payment Related Issue' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await api.post('https://pensionbd-liza.onrender.com/api/pension-holder/complaints', formData);
      setSuccess('Complaint submitted successfully! You will receive updates on the resolution.');
      
      setTimeout(() => {
        navigate('/pension-holder/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/pension-holder/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">File a Complaint</h1>
        <p className="text-gray-600 mt-2">
          Report any issues or concerns regarding your pension application process
        </p>
      </div>

      <div className="card">
        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">Complaint Submitted Successfully</h3>
            <p className="text-green-700 mb-4">{success}</p>
            <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="form-label">
                  Complaint Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="form-input"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="form-label">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="form-input"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="form-label">
                Subject *
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="form-input"
                placeholder="Brief description of your complaint"
                value={formData.subject}
                onChange={handleChange}
                maxLength="200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.subject.length}/200 characters
              </p>
            </div>

            <div>
              <label htmlFor="description" className="form-label">
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                required
                className="form-input"
                placeholder="Please provide a detailed description of your complaint, including any relevant dates, reference numbers, and specific issues you've encountered..."
                value={formData.description}
                onChange={handleChange}
                maxLength="2000"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="relatedApplication" className="form-label">
                  Related Application ID (if applicable)
                </label>
                <input
                  id="relatedApplication"
                  name="relatedApplication"
                  type="text"
                  className="form-input"
                  placeholder="Enter application ID if complaint is related to specific application"
                  value={formData.relatedApplication}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="targetManager" className="form-label">
                  Manager/Officer Name (if applicable)
                </label>
                <input
                  id="targetManager"
                  name="targetManager"
                  type="text"
                  className="form-input"
                  placeholder="Name of the manager/officer if complaint is about specific person"
                  value={formData.targetManager}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Important Information:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Your complaint will be reviewed by the Head of Office</li>
                    <li>You will receive updates on the investigation progress</li>
                    <li>False or malicious complaints may result in account restrictions</li>
                    <li>For urgent matters, please contact the office directly</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/pension-holder/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Submit Complaint'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ComplaintForm;