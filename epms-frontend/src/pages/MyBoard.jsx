// src/pages/MyBoard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBoard } from '../store/slices/taskSlice';
import KanbanBoard from '../components/kanban/KanbanBoard';
import PageHero from '../components/common/PageHero';
import { FaUser } from 'react-icons/fa';

const MyBoard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMyBoard());
  }, [dispatch]);

  return (
    <div className="space-y-4">
      <PageHero
        icon={FaUser}
        iconColor="#7C3AED"
        title="My Board"
        subtitle={`Your personal tasks, ${user?.fullName?.split(' ')[0] || 'User'}`}
      />

      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <KanbanBoard projectId="my-tasks" isMyBoard={true} />
      </div>
    </div>
  );
};

export default MyBoard;