import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const PensionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: user?.name || '',
    nid: user?.nid || '',
    phone: user?.phone || '',
    email: user?.email || '',
    dateOfBirth: '',
    address: '',
    
    // Service Information
    employeeId: user?.employeeId || '',
    department: user?.department || '',
    designation: user?.designation || '',
    joiningDate: user?.joiningDate || '',
    retirementDate: '',
    lastBasicSalary: '',
    
    // Bank Information
    bankName: '',
    branchName: '',
    accountNumber: '',
    routingNumber: '',
    
    // Nominee Information
    nomineeName: '',
    nomineeRelation: '',
    nomineeNid: '',
    nomineeAddress: '',
    
    // Additional Information
    pensionType: 'retirement', // retirement, disability, survivor
    specialCircumstances: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serviceYears, setServiceYears] = useState(0);

  useEffect(() => {
    calculateServiceYears();
  }, [formData.joiningDate, formData.retirementDate]);

  const calculateServiceYears = () => {
    if (formData.joiningDate && formData.retirementDate) {
      const joining = new Date(formData.joiningDate);
      const retirement = new Date(formData.retirementDate);
      const years = (retirement - joining) / (1000 * 60 * 60 * 24 * 365);
      setServiceYears(Math.floor(years * 100) / 100);
    } else if (formData.joiningDate) {
      const joining = new Date(formData.joiningDate);
      const current = new Date();
      const years = (current - joining) / (1000 * 60 * 60 * 24 * 365);
      setServiceYears(Math.floor(years * 100) / 100);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (serviceYears < 19) {
      setError('You must have at least 19 years of service to apply for pension.');
      return false;
    }

    const requiredFields = [
      'fullName', 'nid', 'phone', 'email', 'dateOfBirth', 'address',
      'employeeId', 'department', 'designation', 'joiningDate', 'lastBasicSalary',
      'bankName', 'branchName', 'accountNumber', 'routingNumber',
      'nomineeName', 'nomineeRelation', 'nomineeNid'
    ];

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/api/pension-holder/applications', {
        ...formData,
        serviceYears
      });
      
      setSuccess('Pension application submitted successfully!');
      setTimeout(() => {
        navigate('/pension-holder/status');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
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
        
        <h1 className="text-3xl font-bold text-gray-900">Pension Application Form</h1>
        <p className="text-gray-600 mt-2">
          Please fill in all required information to apply for your pension
        </p>
      </div>

      {/* Service Years Display */}
      <div className={`card mb-8 ${serviceYears >= 19 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center space-x-2">
          {serviceYears >= 19 ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <div>
            <p className={`font-medium ${serviceYears >= 19 ? 'text-green-800' : 'text-red-800'}`}>
              Service Years: {serviceYears} years
            </p>
            <p className={`text-sm ${serviceYears >= 19 ? 'text-green-700' : 'text-red-700'}`}>
              {serviceYears >= 19 
                ? 'You are eligible to apply for pension' 
                : `You need ${(19 - serviceYears).toFixed(1)} more years of service`
              }
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        {/* Personal Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="form-label">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="nid" className="form-label">National ID *</label>
              <input
                id="nid"
                name="nid"
                type="text"
                required
                className="form-input"
                value={formData.nid}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="form-label">Date of Birth *</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                className="form-input"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="form-label">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="address" className="form-label">Address *</label>
            <textarea
              id="address"
              name="address"
              rows="3"
              required
              className="form-input"
              value={formData.address}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        {/* Service Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Service Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="employeeId" className="form-label">Employee ID *</label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                required
                className="form-input"
                value={formData.employeeId}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="department" className="form-label">Department *</label>
              <input
                id="department"
                name="department"
                type="text"
                required
                className="form-input"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="designation" className="form-label">Designation *</label>
              <input
                id="designation"
                name="designation"
                type="text"
                required
                className="form-input"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="joiningDate" className="form-label">Joining Date *</label>
              <input
                id="joiningDate"
                name="joiningDate"
                type="date"
                required
                className="form-input"
                value={formData.joiningDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="retirementDate" className="form-label">Expected/Actual Retirement Date</label>
              <input
                id="retirementDate"
                name="retirementDate"
                type="date"
                className="form-input"
                value={formData.retirementDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastBasicSalary" className="form-label">Last Basic Salary (BDT) *</label>
              <input
                id="lastBasicSalary"
                name="lastBasicSalary"
                type="number"
                required
                className="form-input"
                value={formData.lastBasicSalary}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="pensionType" className="form-label">Pension Type *</label>
              <select
                id="pensionType"
                name="pensionType"
                required
                className="form-input"
                value={formData.pensionType}
                onChange={handleChange}
              >
                <option value="retirement">Retirement Pension</option>
                <option value="disability">Disability Pension</option>
                <option value="survivor">Survivor Pension</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Bank Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bankName" className="form-label">Bank Name *</label>
              <input
                id="bankName"
                name="bankName"
                type="text"
                required
                className="form-input"
                value={formData.bankName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="branchName" className="form-label">Branch Name *</label>
              <input
                id="branchName"
                name="branchName"
                type="text"
                required
                className="form-input"
                value={formData.branchName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="accountNumber" className="form-label">Account Number *</label>
              <input
                id="accountNumber"
                name="accountNumber"
                type="text"
                required
                className="form-input"
                value={formData.accountNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="routingNumber" className="form-label">Routing Number *</label>
              <input
                id="routingNumber"
                name="routingNumber"
                type="text"
                required
                className="form-input"
                value={formData.routingNumber}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Nominee Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Nominee Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nomineeName" className="form-label">Nominee Name *</label>
              <input
                id="nomineeName"
                name="nomineeName"
                type="text"
                required
                className="form-input"
                value={formData.nomineeName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="nomineeRelation" className="form-label">Relationship with Nominee *</label>
              <select
                id="nomineeRelation"
                name="nomineeRelation"
                required
                className="form-input"
                value={formData.nomineeRelation}
                onChange={handleChange}
              >
                <option value="">Select Relationship</option>
                <option value="spouse">Spouse</option>
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="brother">Brother</option>
                <option value="sister">Sister</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="nomineeNid" className="form-label">Nominee National ID *</label>
              <input
                id="nomineeNid"
                name="nomineeNid"
                type="text"
                required
                className="form-input"
                value={formData.nomineeNid}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="nomineeAddress" className="form-label">Nominee Address</label>
            <textarea
              id="nomineeAddress"
              name="nomineeAddress"
              rows="3"
              className="form-input"
              value={formData.nomineeAddress}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Information</h2>
          <div>
            <label htmlFor="specialCircumstances" className="form-label">
              Special Circumstances (if any)
            </label>
            <textarea
              id="specialCircumstances"
              name="specialCircumstances"
              rows="4"
              className="form-input"
              placeholder="Please describe any special circumstances that may affect your pension application..."
              value={formData.specialCircumstances}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
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
            disabled={loading || serviceYears < 19}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <Save className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PensionForm;