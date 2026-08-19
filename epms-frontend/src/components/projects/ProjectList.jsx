// src/components/projects/ProjectList.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProjects, deleteProject } from '../../store/slices/projectSlice';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import ProjectDetail from './ProjectDetail';
import PageHero from '../common/PageHero';
import { FaProjectDiagram, FaPlus } from 'react-icons/fa';

const ProjectList = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, isLoading } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null); // For modal view
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const canCreateProject = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  // Landing directly on /projects/new (e.g. from the Dashboard) opens the
  // create form over this list instead of rendering it on a blank page.
  useEffect(() => {
    if (location.pathname === '/projects/new' && canCreateProject) {
      setEditingProject(null);
      setShowForm(true);
    }
  }, [location.pathname, canCreateProject]);

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    if (location.pathname === '/projects/new') {
      navigate('/projects');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await dispatch(deleteProject(id));
    }
  };

  // Calculate stats
  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'ACTIVE').length || 0;
  const completedProjects = projects?.filter(p => p.status === 'COMPLETED').length || 0;

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? project.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  // Handle view project - using modal instead of navigation
  const handleViewProject = (project) => {
    setViewingProject(project);
  };

  if (isLoading && projects.length === 0) {
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
        icon={FaProjectDiagram}
        iconColor="#7C3AED"
        title="Projects"
        subtitle="Manage all your projects in one place"
        stats={[
          { label: 'Total', value: totalProjects, color: 'bg-gray-700' },
          { label: 'Active', value: activeProjects, color: 'bg-green-500' },
          { label: 'Completed', value: completedProjects, color: 'bg-violet-500' },
        ]}
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search projects..."
        filterOptions={[
          { value: 'PLANNING', label: 'Planning' },
          { value: 'ACTIVE', label: 'Active' },
          { value: 'ON_HOLD', label: 'On Hold' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'CANCELLED', label: 'Cancelled' },
        ]}
        filterValue={filterStatus}
        onFilter={setFilterStatus}
        onCreateClick={canCreateProject ? () => {
          setEditingProject(null);
          setShowForm(true);
        } : undefined}
        createLabel="New Project"
      />

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded bg-white">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-3">
            <FaProjectDiagram className="text-xl" />
          </div>
          <p className="text-sm text-gray-500">No projects found</p>
          <p className="text-xs text-gray-400 mt-1">
            {searchTerm || filterStatus ? 'Try adjusting your filters' : 'Create your first project to get started'}
          </p>
          {canCreateProject && !searchTerm && !filterStatus && (
            <button
              onClick={() => {
                setEditingProject(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 mt-3 bg-[#7C3AED] text-white rounded text-xs font-medium hover:bg-[#6D28D9] transition-colors"
            >
              <FaPlus className="text-[10px]" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={() => handleViewProject(project)}
              onEdit={() => {
                setEditingProject(project);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(project.id)}
              userRole={user?.role}
              userId={user?.id}
            />
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      {showForm && canCreateProject && (
        <ProjectForm
          project={editingProject}
          onClose={closeForm}
          onSuccess={() => dispatch(fetchProjects())}
        />
      )}

      {/* Project Detail Modal - Using the project data directly */}
      {viewingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProjectDetail
              project={viewingProject}
              onClose={() => setViewingProject(null)}
              userRole={user?.role}
              userId={user?.id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;