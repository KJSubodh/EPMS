// src/pages/Board.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects } from '../store/slices/projectSlice';
import PageHero from '../components/common/PageHero';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { FaColumns, FaProjectDiagram } from 'react-icons/fa';

const Board = () => {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.projects);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  return (
    <div className="space-y-4">
      <PageHero
        icon={FaColumns}
        iconColor="#7C3AED"
        title="Board"
        subtitle="Visualize and manage tasks across projects"
      />

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <FaProjectDiagram className="text-gray-400" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          >
            <option value="">Select a project...</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProjectId ? (
        <KanbanBoard projectId={selectedProjectId} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
          <FaColumns className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Select a project to view its board</p>
        </div>
      )}
    </div>
  );
};

export default Board;