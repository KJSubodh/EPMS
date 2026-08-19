// src/components/tasks/TaskList.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchTasks, deleteTask, updateTaskStatus } from '../../store/slices/taskSlice';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import PageHero from '../common/PageHero';
import { FaTasks, FaPlus } from 'react-icons/fa';

const TaskList = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { tasks, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const isAdminOrPM = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';
  const canCreateTask = isAdminOrPM;

  // Landing directly on /tasks/new (e.g. from the Dashboard) opens the
  // create form over this list instead of rendering it on a blank page.
  useEffect(() => {
    if (location.pathname === '/tasks/new' && canCreateTask) {
      setEditingTask(null);
      setShowForm(true);
    }
  }, [location.pathname, canCreateTask]);

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
    if (location.pathname === '/tasks/new') {
      navigate('/tasks');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask(id));
    }
  };

  const handleStatusChange = async (id, status) => {
    await dispatch(updateTaskStatus({ id, status }));
  };

  // Calculate stats
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'DONE').length || 0;
  const inProgressTasks = tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0;
  const blockedTasks = tasks?.filter(t => t.status === 'BLOCKED').length || 0;
  const overdueTasks = tasks?.filter(t => {
    if (t.status === 'DONE') return false;
    return new Date(t.dueDate) < new Date();
  }).length || 0;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? task.status === filterStatus : true;
    const matchesPriority = filterPriority ? task.priority === filterPriority : true;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleFilter = (value, type) => {
    if (type === 'status') {
      setFilterStatus(value);
    } else if (type === 'priority') {
      setFilterPriority(value);
    }
  };

  if (isLoading && tasks.length === 0) {
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
        icon={FaTasks}
        iconColor="#7C3AED"
        title="Tasks"
        subtitle="Manage and track all your tasks"
        stats={[
          { label: 'Total', value: totalTasks, color: 'bg-gray-700' },
          { label: 'Completed', value: completedTasks, color: 'bg-green-500' },
          { label: 'In Progress', value: inProgressTasks, color: 'bg-amber-500' },
          { label: 'Overdue', value: overdueTasks, color: 'bg-red-500' },
        ]}
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search tasks..."
        filterOptions={[
          { value: 'TODO', label: 'Todo' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'REVIEW', label: 'Review' },
          { value: 'DONE', label: 'Done' },
          { value: 'BLOCKED', label: 'Blocked' },
        ]}
        filterValue={filterStatus}
        onFilter={(value) => handleFilter(value, 'status')}
        onCreateClick={canCreateTask ? () => {
          setEditingTask(null);
          setShowForm(true);
        } : undefined}
        createLabel="New Task"
      />

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded bg-white">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-3">
            <FaTasks className="text-xl" />
          </div>
          <p className="text-sm text-gray-500">No tasks found</p>
          <p className="text-xs text-gray-400 mt-1">
            {searchTerm || filterStatus || filterPriority ? 'Try adjusting your filters' : 'Create your first task to get started'}
          </p>
          {canCreateTask && !searchTerm && !filterStatus && !filterPriority && (
            <button
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 mt-3 bg-[#7C3AED] text-white rounded text-xs font-medium hover:bg-[#6D28D9] transition-colors"
            >
              <FaPlus className="text-[10px]" />
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={() => setViewingTask(task)}
              onEdit={() => {
                setEditingTask(task);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(task.id)}
              onStatusChange={handleStatusChange}
              userRole={user?.role}
              userId={user?.id}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal - Only for Admin/PM */}
      {showForm && canCreateTask && (
        <TaskForm
          task={editingTask}
          onClose={closeForm}
          onSuccess={() => dispatch(fetchTasks())}
        />
      )}

      {/* Task Detail Modal */}
      {viewingTask && (
        <TaskDetail
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          userRole={user?.role}
          userId={user?.id}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default TaskList;