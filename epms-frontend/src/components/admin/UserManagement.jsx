// src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, changeUserRole, activateUser, deactivateUser } from '../../store/slices/adminSlice';
import EmployeeForm from './EmployeeForm';
import PageHero from '../common/PageHero';
import { FaUserCog, FaUsers, FaUserCheck, FaUserTimes, FaShieldAlt } from 'react-icons/fa';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.admin);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      await dispatch(changeUserRole({ id: userId, role: newRole }));
      dispatch(fetchUsers());
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    const action = isActive ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      if (isActive) {
        await dispatch(deactivateUser(userId));
      } else {
        await dispatch(activateUser(userId));
      }
      dispatch(fetchUsers());
    }
  };

  // Calculate stats
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.isActive).length || 0;
  const inactiveUsers = users?.filter(u => !u.isActive).length || 0;
  const adminUsers = users?.filter(u => u.role === 'ADMIN').length || 0;

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole ? user.role === filterRole : true;
    const matchesStatus = filterStatus !== '' ? String(user.isActive) === filterStatus : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const colors = {
      'ADMIN': 'bg-violet-500',
      'PROJECT_MANAGER': 'bg-blue-500',
      'EMPLOYEE': 'bg-gray-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  if (isLoading && users.length === 0) {
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
        icon={FaUserCog}
        iconColor="#7C3AED"
        title="User Management"
        subtitle="Manage user roles, permissions, and account status"
        stats={[
          { label: 'Total', value: totalUsers, color: 'bg-gray-700' },
          { label: 'Active', value: activeUsers, color: 'bg-green-500' },
          { label: 'Inactive', value: inactiveUsers, color: 'bg-red-500' },
          { label: 'Admins', value: adminUsers, color: 'bg-violet-500' },
        ]}
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search users..."
        filterOptions={[
          { value: 'ADMIN', label: 'Admin' },
          { value: 'PROJECT_MANAGER', label: 'Project Manager' },
          { value: 'EMPLOYEE', label: 'Employee' },
        ]}
        filterValue={filterRole}
        onFilter={setFilterRole}
        filterPlaceholder="All Roles"
      />

      {/* User Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Department</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Designation</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 py-8 text-center text-gray-500">
                    <p className="text-sm font-medium">No users found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.id === currentUser?.id ? 'bg-gray-50' : ''}`}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getRoleBadge(user.role)}`}>
                          {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {user.fullName}
                            {user.id === currentUser?.id && (
                              <span className="ml-1.5 text-[10px] text-gray-400 font-normal">(You)</span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-500 md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 hidden md:table-cell">{user.email}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 hidden lg:table-cell">{user.department || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 hidden lg:table-cell">{user.designation || '—'}</td>
                    <td className="px-3 py-2.5">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === currentUser?.id}
                        className={`border rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] ${
                          user.id === currentUser?.id ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                        } ${
                          user.role === 'ADMIN' ? 'border-violet-300 text-violet-700' :
                          user.role === 'PROJECT_MANAGER' ? 'border-blue-300 text-blue-700' :
                          'border-gray-300 text-gray-700'
                        }`}
                      >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="PROJECT_MANAGER">Project Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-medium text-white ${
                        user.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          disabled={user.id === currentUser?.id}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                            user.isActive 
                              ? 'text-red-500 hover:text-red-700 hover:bg-red-50' 
                              : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                          } ${
                            user.id === currentUser?.id 
                              ? 'opacity-40 cursor-not-allowed' 
                              : 'cursor-pointer'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-violet-500 rounded"></span>
              <span>You cannot change your own role or status</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-red-500 rounded"></span>
              <span>Cannot demote the last Admin</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="font-mono">{filteredUsers.length} of {totalUsers} users shown</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EmployeeForm
          user={editingUser}
          onClose={() => {
            setEditingUser(null);
            dispatch(fetchUsers());
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;