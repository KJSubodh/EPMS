// src/pages/TaskDetailPage.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, updateTaskStatus } from '../store/slices/taskSlice';
import TaskDetail from '../components/tasks/TaskDetail';

// TaskDetail expects a `task` object as a prop rather than fetching by id
// itself, so this page looks the task up from the already-loaded tasks
// list (e.g. from Dashboard) and falls back to fetching if it's not
// there yet (e.g. on a hard refresh / direct link).
//
// Close should return wherever the user came from (Dashboard, Tasks list,
// etc). The linking page passes that via route state ({ from }). Falling
// back to /tasks covers direct links / page refreshes where there's no
// "from" in state.
const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, isLoading } = useSelector((state) => state.tasks);

  const task = tasks?.find((t) => String(t.id) === String(id));

  useEffect(() => {
    if (!task) {
      dispatch(fetchTasks());
    }
  }, [dispatch, task]);

  const handleStatusChange = async (taskId, status) => {
    await dispatch(updateTaskStatus({ id: taskId, status }));
  };

  const handleClose = () => navigate(location.state?.from || '/tasks');

  if (!task && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-gray-500 text-sm">Task not found</p>
        <button
          onClick={handleClose}
          className="text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9]"
        >
          ← Back to tasks
        </button>
      </div>
    );
  }

  return (
    <TaskDetail
      task={task}
      onClose={handleClose}
      userRole={user?.role}
      userId={user?.id}
      onStatusChange={handleStatusChange}
    />
  );
};

export default TaskDetailPage;