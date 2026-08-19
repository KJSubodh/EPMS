// src/pages/Board.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects } from '../store/slices/projectSlice';
import PageHero from '../components/common/PageHero';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { FaColumns } from 'react-icons/fa';

const Board = () => {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.projects);
  const { board } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(String(projects[0].id));
    }
  }, [projects, selectedProjectId]);

  const canCreateTask = (user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && !!selectedProjectId;

  // Stats derived from the currently loaded board, mirroring TaskList's hero stats
  const allTasks = board?.columns?.flatMap((col) => col.tasks || []) || [];
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const overdueTasks = allTasks.filter((t) => t.status !== 'DONE' && new Date(t.dueDate) < new Date()).length;

  return (
    <div className="space-y-4">
      <PageHero
        icon={FaColumns}
        iconColor="#7C3AED"
        title="Board"
        subtitle="Visualize and manage tasks across projects"
        stats={[
          { label: 'Total', value: totalTasks, color: 'bg-gray-700' },
          { label: 'Completed', value: completedTasks, color: 'bg-green-500' },
          { label: 'In Progress', value: inProgressTasks, color: 'bg-amber-500' },
          { label: 'Overdue', value: overdueTasks, color: 'bg-red-500' },
        ]}
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search tasks..."
        filterOptions={projects.map((project) => ({ value: String(project.id), label: project.name }))}
        filterValue={selectedProjectId}
        onFilter={setSelectedProjectId}
        filterPlaceholder="Select a project..."
        onCreateClick={canCreateTask ? () => setShowCreateModal(true) : undefined}
        createLabel="Add Task"
      />

      {selectedProjectId ? (
        <KanbanBoard
          projectId={selectedProjectId}
          searchTerm={searchTerm}
          showCreateModal={showCreateModal}
          onCloseCreateModal={() => setShowCreateModal(false)}
        />
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