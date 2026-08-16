// src/components/profile/index.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaBriefcase, 
  FaEdit,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaUserCircle,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaGlobe,
  FaAward,
  FaArrowLeft,
  FaChevronLeft
} from 'react-icons/fa';
import PageHero from '../common/PageHero';
import { updateUserProfile } from '../../store/slices/authSlice';
import { fetchUserById, updateEmployee, clearSelectedUser } from '../../store/slices/userSlice';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const { selectedUser, isLoading: userLoading } = useSelector((state) => state.users);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  
  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    bio: '',
    skills: [],
    linkedin: '',
    github: '',
    twitter: '',
    department: '',
    designation: ''
  });
  
  const [newSkill, setNewSkill] = useState('');

  // Determine if viewing own profile
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    
    const own = !id || id === currentUser.id;
    setIsOwnProfile(own);
    setProfileUser(own ? currentUser : selectedUser);
    
    if (own) {
      setLoading(false);
    }
  }, [id, currentUser, isAuthenticated, selectedUser]);

  // Fetch user data when viewing someone else's profile
  useEffect(() => {
    if (!isAuthenticated || !id || isOwnProfile) return;
    
    dispatch(fetchUserById(id));
  }, [dispatch, id, isAuthenticated, isOwnProfile]);

  // Update form data when profileUser changes
  useEffect(() => {
    if (profileUser) {
      setFormData({
        phone: profileUser?.phone || '',
        location: profileUser?.location || '',
        bio: profileUser?.bio || '',
        skills: profileUser?.skills || [],
        linkedin: profileUser?.linkedin || '',
        github: profileUser?.github || '',
        twitter: profileUser?.twitter || '',
        department: profileUser?.department || '',
        designation: profileUser?.designation || ''
      });
      setLoading(false);
    }
  }, [profileUser]);

  const isAdmin = currentUser?.role === 'ADMIN';
  const canEdit = isOwnProfile || isAdmin;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    if (!role) return 'bg-gray-500';
    const roleLower = role.toUpperCase();
    if (roleLower === 'ADMIN') {
      return 'bg-violet-500';
    } else if (roleLower === 'MANAGER' || roleLower === 'PROJECT_MANAGER') {
      return 'bg-blue-500';
    }
    return 'bg-green-500';
  };

  const getRoleLabel = (role) => {
    if (!role) return 'Employee';
    const roleLower = role.toUpperCase();
    if (roleLower === 'ADMIN') return 'Admin';
    if (roleLower === 'PROJECT_MANAGER' || roleLower === 'MANAGER') return 'Project Manager';
    return 'Employee';
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills,
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        department: formData.department,
        designation: formData.designation
      };
      
      if (isOwnProfile) {
        await dispatch(updateUserProfile(updateData)).unwrap();
      } else {
        await dispatch(updateEmployee({ id, data: updateData })).unwrap();
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      phone: profileUser?.phone || '',
      location: profileUser?.location || '',
      bio: profileUser?.bio || '',
      skills: profileUser?.skills || [],
      linkedin: profileUser?.linkedin || '',
      github: profileUser?.github || '',
      twitter: profileUser?.twitter || '',
      department: profileUser?.department || '',
      designation: profileUser?.designation || ''
    });
    setIsEditing(false);
  };

  // Loading state
  if (loading || (!isOwnProfile && userLoading) || (!profileUser && !isOwnProfile)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user data, show error
  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 text-sm">User not found</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-2 text-xs text-[#7C3AED] hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Projects', 
      value: profileUser?.stats?.projects ?? profileUser?.projectCount ?? 0, 
      color: 'bg-violet-500'
    },
    { 
      label: 'Tasks', 
      value: profileUser?.stats?.tasks ?? profileUser?.taskCount ?? 0, 
      color: 'bg-blue-500'
    },
    { 
      label: 'Completed', 
      value: profileUser?.stats?.completed ?? profileUser?.completedCount ?? 0, 
      color: 'bg-green-500'
    },
    { 
      label: 'Team', 
      value: profileUser?.stats?.teamMembers ?? profileUser?.teamCount ?? 0, 
      color: 'bg-amber-500'
    },
  ];

  const visibleStats = stats.filter(stat => stat.value > 0);

  const sections = [
    { id: 'personal', label: 'Personal', icon: FaUser },
    { id: 'work', label: 'Work', icon: FaBriefcase },
    { id: 'about', label: 'About', icon: FaAward },
    { id: 'social', label: 'Social', icon: FaGlobe },
  ];

  return (
    <>
      {/* Enhanced Back Button - Only show when viewing someone else's profile */}
      {!isOwnProfile && (
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#7C3AED]/30 hover:shadow-md hover:shadow-[#7C3AED]/5 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-[#7C3AED]/10 flex items-center justify-center transition-colors duration-200">
              <FaChevronLeft className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#7C3AED] transition-colors duration-200" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                Back
              </span>
              <span className="text-[10px] text-gray-400 group-hover:text-gray-500 transition-colors duration-200">
                Return to employees
              </span>
            </div>
          </button>

          {/* Optional: Breadcrumb indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-[#7C3AED]">Employees</span>
            <FaChevronLeft className="w-3 h-3 text-gray-300 rotate-180" />
            <span className="text-gray-600 truncate max-w-[150px]">{profileUser?.fullName}</span>
          </div>
        </div>
      )}

      <PageHero
        icon={FaUserCircle}
        iconColor="#7C3AED"
        title={isOwnProfile ? 'Profile' : profileUser?.fullName || 'Employee Profile'}
        subtitle={`${getRoleLabel(profileUser?.role)} · ${profileUser?.department || 'No department'}`}
        stats={visibleStats}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-1.5 sticky top-20">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-[#7C3AED] text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`text-sm ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-medium">{section.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1 h-5 bg-white rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Card - Compact */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: getAvatarColor(profileUser?.fullName) }}
                >
                  {getInitials(profileUser?.fullName)}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{profileUser?.fullName ?? profileUser?.name ?? 'User'}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{profileUser?.email ?? 'No email'}</p>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className={`inline-block text-[9px] font-medium px-2 py-0.5 rounded-full text-white ${getRoleColor(profileUser?.role)}`}>
                      {getRoleLabel(profileUser?.role)}
                    </span>
                  </div>
                </div>
              </div>
              {canEdit && !isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] text-white rounded-lg text-xs font-medium hover:bg-[#6D28D9] transition-colors"
                >
                  <FaEdit className="w-3 h-3" />
                  Edit
                </button>
              ) : canEdit && isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] text-white rounded-lg text-xs font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
                  >
                    <FaSave className="w-3 h-3" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Content Sections - Compact */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {/* Personal Details */}
            {activeSection === 'personal' && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#7C3AED]/10 rounded flex items-center justify-center">
                    <FaUser className="text-[#7C3AED] text-[11px]" />
                  </div>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
                      <FaUser className="text-gray-400 text-[11px]" />
                      <span className="text-xs text-gray-700">{profileUser?.fullName ?? profileUser?.name ?? '—'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Email</label>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
                      <FaEnvelope className="text-gray-400 text-[11px]" />
                      <span className="text-xs text-gray-700">{profileUser?.email ?? '—'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                        placeholder="Enter phone"
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
                        <FaPhone className="text-gray-400 text-[11px]" />
                        <span className="text-xs text-gray-700">{profileUser?.phone ?? 'Not set'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                        placeholder="Enter location"
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
                        <FaMapMarkerAlt className="text-gray-400 text-[11px]" />
                        <span className="text-xs text-gray-700">{profileUser?.location ?? 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Work Details */}
            {activeSection === 'work' && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#7C3AED]/10 rounded flex items-center justify-center">
                    <FaBriefcase className="text-[#7C3AED] text-[11px]" />
                  </div>
                  Work Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Department</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                        placeholder="Enter department"
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
                        <FaBuilding className="text-gray-400 text-[11px]" />
                        <span className="text-xs text-gray-700">{profileUser?.department ?? 'Not set'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Designation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                        placeholder="Enter designation"
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
                        <FaBriefcase className="text-gray-400 text-[11px]" />
                        <span className="text-xs text-gray-700">{profileUser?.designation ?? 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* About & Skills */}
            {activeSection === 'about' && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#7C3AED]/10 rounded flex items-center justify-center">
                    <FaAward className="text-[#7C3AED] text-[11px]" />
                  </div>
                  About & Skills
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <div className="px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
                        <p className="text-xs text-gray-700 leading-relaxed">{profileUser?.bio ?? 'No bio added yet'}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Skills</label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                            placeholder="Add a skill..."
                          />
                          <button
                            onClick={handleAddSkill}
                            className="px-3 py-1.5 bg-[#7C3AED] text-white rounded text-xs font-medium hover:bg-[#6D28D9] transition-colors"
                          >
                            <FaPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="group flex items-center gap-1.5 px-2 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded text-xs font-medium border border-[#7C3AED]/20"
                            >
                              {skill}
                              <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="text-[#7C3AED]/50 hover:text-red-500 transition-colors"
                              >
                                <FaTrash className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                          {formData.skills.length === 0 && (
                            <span className="text-xs text-gray-400">No skills added</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {profileUser?.skills && profileUser.skills.length > 0 ? (
                          profileUser.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded text-xs font-medium border border-[#7C3AED]/20"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400">No skills added</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {activeSection === 'social' && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#7C3AED]/10 rounded flex items-center justify-center">
                    <FaGlobe className="text-[#7C3AED] text-[11px]" />
                  </div>
                  Social Links
                </h3>
                {isEditing ? (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">LinkedIn</label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#0077b5]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaLinkedin className="text-[#0077b5] text-sm" />
                        </div>
                        <input
                          type="url"
                          value={formData.linkedin}
                          onChange={(e) => handleInputChange('linkedin', e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">GitHub</label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#333]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaGithub className="text-[#333] text-sm" />
                        </div>
                        <input
                          type="url"
                          value={formData.github}
                          onChange={(e) => handleInputChange('github', e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                          placeholder="https://github.com/username"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Twitter</label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#1DA1F2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaTwitter className="text-[#1DA1F2] text-sm" />
                        </div>
                        <input
                          type="url"
                          value={formData.twitter}
                          onChange={(e) => handleInputChange('twitter', e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded border border-gray-200">
                      <FaLinkedin className="text-[#0077b5] text-sm" />
                      <div>
                        <p className="text-[9px] text-gray-400">LinkedIn</p>
                        <a href={profileUser?.linkedin || '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-700 hover:text-[#0077b5] truncate block max-w-[120px]">
                          {profileUser?.linkedin ? 'View Profile' : 'Not connected'}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded border border-gray-200">
                      <FaGithub className="text-[#333] text-sm" />
                      <div>
                        <p className="text-[9px] text-gray-400">GitHub</p>
                        <a href={profileUser?.github || '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-700 hover:text-[#333] truncate block max-w-[120px]">
                          {profileUser?.github ? 'View Profile' : 'Not connected'}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded border border-gray-200">
                      <FaTwitter className="text-[#1DA1F2] text-sm" />
                      <div>
                        <p className="text-[9px] text-gray-400">Twitter</p>
                        <a href={profileUser?.twitter || '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-700 hover:text-[#1DA1F2] truncate block max-w-[120px]">
                          {profileUser?.twitter ? 'View Profile' : 'Not connected'}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded border border-gray-200">
                      <FaEnvelope className="text-[#7C3AED] text-sm" />
                      <div>
                        <p className="text-[9px] text-gray-400">Email</p>
                        <a href={`mailto:${profileUser?.email}`} className="text-xs text-gray-700 hover:text-[#7C3AED] truncate block max-w-[120px]">
                          {profileUser?.email || 'No email'}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;