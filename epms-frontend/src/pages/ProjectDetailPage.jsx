// src/pages/ProjectDetailPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProjectDetail from '../components/projects/ProjectDetail';
import { useSelector } from 'react-redux';

// Renders ProjectDetail as a full page (used when navigating directly to
// /projects/:id, e.g. from Dashboard "Recent Activity"). ProjectDetail
// already fetches its own data via useParams()/fetchProjectById, so we
// just need to give it a Layout-wrapped page and a working close handler.
//
// Close should return wherever the user came from (Dashboard, Projects
// list, etc). The linking page passes that via route state ({ from }).
// Falling back to /projects covers direct links / page refreshes where
// there's no "from" in state.
const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleClose = () => navigate(location.state?.from || '/projects');

  return (
    <ProjectDetail
      onClose={handleClose}
      userRole={user?.role}
      userId={user?.id}
    />
  );
};

export default ProjectDetailPage;