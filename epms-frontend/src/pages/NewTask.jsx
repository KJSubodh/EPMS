// src/pages/NewTask.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import TaskForm from '../components/tasks/TaskForm';
import { fetchTasks } from '../store/slices/taskSlice';

// TaskForm already renders as a fixed, full-screen overlay, so it can be
// dropped straight onto its own route. Closing/succeeding just navigates
// back to the tasks list.
const NewTask = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <TaskForm
      onClose={() => navigate('/tasks')}
      onSuccess={() => dispatch(fetchTasks())}
    />
  );
};

export default NewTask;