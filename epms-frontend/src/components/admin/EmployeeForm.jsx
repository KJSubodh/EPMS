// src/components/admin/EmployeeForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/adminSlice';
import { FaTimes, FaUser, FaBuilding, FaShieldAlt } from 'react-icons/fa';

const DEPARTMENT_OPTIONS = [
  'Engineering', 'Design', 'Marketing', 'Sales', 'Human Resources',
  'Finance', 'Operations', 'Product', 'Research & Development',
  'Customer Support', 'Quality Assurance', 'DevOps', 'Data Science',
  'Legal', 'Administration'
];

const DESIGNATION_OPTIONS = [
  'Software Engineer', 'Senior Software Engineer', 'Lead Engineer', 'Principal Engineer',
  'Engineering Manager', 'CTO', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Mobile Developer', 'DevOps Engineer', 'QA Engineer', 'Data Engineer',
  'UI Designer', 'UX Designer', 'Product Designer', 'Design Lead', 'Design Director',
  'Marketing Manager', 'Digital Marketing Specialist', 'Content Writer', 'SEO Specialist', 'Marketing Director',
  'Sales Manager', 'Account Executive', 'Sales Development Rep', 'Sales Director',
  'HR Manager', 'Recruiter', 'HR Business Partner', 'HR Director',
  'Accountant', 'Financial Analyst', 'Finance Manager', 'CFO',
  'Operations Manager', 'Operations Analyst', 'COO',
  'Product Manager', 'Product Owner', 'Product Analyst', 'Director of Product',
  'CEO', 'VP of Engineering', 'VP of Product', 'VP of Marketing', 'VP of Sales',
  'Director', 'Senior Director',
  'Consultant', 'Analyst', 'Coordinator', 'Associate', 'Intern'
];

const ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'ADMIN', label: 'Admin' }
];

const inputClass = (hasError) =>
  `w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors ${
    hasError ? 'border-red-500' : ''
  }`;

const EmployeeForm = ({ user, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    designation: '',
    role: '',
    profileImage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        department: user.department || '',
        designation: user.designation || '',
        role: user.role || 'EMPLOYEE',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateUser({ id: user.id, data: formData }));
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7C3AED] rounded flex items-center justify-center flex-shrink-0">
              <FaUser className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Edit User</h2>
              <p className="text-[10px] text-gray-500">Update user information and permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Personal Information */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FaUser className="w-3 h-3 text-[#7C3AED]" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClass(errors.fullName)}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-[10px] mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass(errors.email)}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FaBuilding className="w-3 h-3 text-[#7C3AED]" />
              Work Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={inputClass(false)}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENT_OPTIONS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">
                  Designation
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={inputClass(false)}
                >
                  <option value="">Select Designation</option>
                  {DESIGNATION_OPTIONS.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FaShieldAlt className="w-3 h-3 text-[#7C3AED]" />
              Role &amp; Permissions
            </h3>
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">
              User Role *
            </label>
            <div className="flex gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: opt.value }))}
                  className={`flex-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                    formData.role === opt.value
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-[#7C3AED]/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Note: You cannot change your own role
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[#7C3AED] text-white rounded text-xs font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting && (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {isSubmitting ? 'Saving...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;