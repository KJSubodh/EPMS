// src/components/employees/EmployeeList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../../store/slices/userSlice';
import EmployeeCard from './EmployeeCard';
import PageHero from '../common/PageHero';
import EmployeeForm from '../admin/EmployeeForm';
import { FaUsers, FaPlus } from 'react-icons/fa';

const EmployeeList = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const employees = users || [];

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.isActive).length;
  const inactiveEmployees = employees.filter(emp => !emp.isActive).length;

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? String(emp.isActive) === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  if (isLoading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Unified Hero */}
      <PageHero
        icon={FaUsers}
        iconColor="#7C3AED"
        title="Employees"
        subtitle="Manage your team members"
        stats={[
          { label: 'Total', value: totalEmployees, color: 'bg-gray-700' },
          { label: 'Active', value: activeEmployees, color: 'bg-green-500' },
          { label: 'Inactive', value: inactiveEmployees, color: 'bg-red-500' },
        ]}
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search employees..."
        filterOptions={[
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' },
        ]}
        filterValue={filterStatus}
        onFilter={setFilterStatus}
        filterPlaceholder="All Status"
        onCreateClick={() => {
          setEditingEmployee(null);
          setShowForm(true);
        }}
        createLabel="Add Employee"
      />

      {/* Employee Cards */}
      {filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded bg-white">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-3">
            <FaUsers className="text-xl" />
          </div>
          <p className="text-sm text-gray-500">No employees found</p>
          <p className="text-xs text-gray-400 mt-1">
            {searchTerm || filterStatus ? 'Try adjusting your filters' : 'Add your first employee to get started'}
          </p>
          {!searchTerm && !filterStatus && (
            <button
              onClick={() => {
                setEditingEmployee(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 mt-3 bg-[#7C3AED] text-white rounded text-xs font-medium hover:bg-[#6D28D9] transition-colors"
            >
              <FaPlus className="text-[10px]" />
              Add Employee
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEmployees.map((user) => (
            <EmployeeCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onClose={() => {
            setShowForm(false);
            setEditingEmployee(null);
          }}
          onSuccess={() => dispatch(fetchEmployees())}
        />
      )}
    </div>
  );
};

export default EmployeeList;