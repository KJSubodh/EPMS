// src/pages/NewProject.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ProjectForm from '../components/projects/ProjectForm';
import { fetchProjects } from '../store/slices/projectSlice';

// ProjectForm already renders as a fixed, full-screen overlay, so it can
// be dropped straight onto its own route. Closing/succeeding just
// navigates back to the projects list.
const NewProject = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <ProjectForm
      onClose={() => navigate('/projects')}
      onSuccess={() => dispatch(fetchProjects())}
    />
  );
};

export default NewProject;