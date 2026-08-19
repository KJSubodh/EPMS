// src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, changeUserRole, activateUser, deactivateUser } from '../../store/slices/adminSlice';
import EmployeeForm from './EmployeeForm';
import PageHero from '../common/PageHero';
import { FaUserCog, FaUserCheck, FaUserTimes, FaEdit, FaUsers } from 'react-icons/fa';

const ROLE_COLORS = {
  ADMIN: '#7C3AED',
  PROJECT_MANAGER: '#3B82F6',
  EMPLOYEE: '#16A34A'
};

const ROLE_LABELS = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  EMPLOYEE: 'Employee'
};

const getAvatarColor = (name) => {
  const colors = ['#7C3AED', '#3B82F6', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#14B8A6'];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

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
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-3">
              <FaUsers className="text-xl" />
            </div>
            <p className="text-sm text-gray-500">No users found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Department</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Designation</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const avatarColor = getAvatarColor(user.fullName);
                  return (
                    <tr key={user.id} className={`hover:bg-gray-50/80 transition-colors ${isSelf ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {user.fullName?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {user.fullName}
                              {isSelf && (
                                <span className="ml-1.5 text-[10px] text-gray-400 font-normal">(You)</span>
                              )}
                            </p>
                            <p className="text-[10px] text-gray-500 md:hidden truncate">{user.email}</p>
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
                          disabled={isSelf}
                          className="border rounded px-1.5 py-0.5 text-[9px] font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[#7C3AED] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70 bg-white"
                          style={{
                            borderColor: `${ROLE_COLORS[user.role] || '#6B7280'}55`,
                            color: ROLE_COLORS[user.role] || '#6B7280'
                          }}
                        >
                          <option value="EMPLOYEE">Employee</option>
                          <option value="PROJECT_MANAGER">Project Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium text-white"
                          style={{ backgroundColor: user.isActive ? '#16A34A' : '#EF4444' }}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full bg-white/70 ${user.isActive ? 'animate-pulse' : ''}`}></span>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingUser(user)}
                            title="Edit user"
                            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                            disabled={isSelf}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                            className={`p-1.5 rounded transition-colors ${
                              user.isActive
                                ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                            } ${isSelf ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {user.isActive ? <FaUserTimes className="w-3 h-3" /> : <FaUserCheck className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

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