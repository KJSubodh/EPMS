// src/pages/Reports.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PageHero from '../components/common/PageHero';
import ReportGenerator from '../components/reports/ReportGenerator';
import { FaChartBar } from 'react-icons/fa';

const Reports = () => {
  const { user } = useSelector((state) => state.auth);
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.admin);
  
  const [filterType, setFilterType] = useState('month');

  // Get actual data counts
  const totalProjects = projects?.length || 0;
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeUsers = users?.filter(u => u.isActive).length || 0;

  return (
    <div>
      {/* Unified Hero */}
      <PageHero
        icon={FaChartBar}
        iconColor="#7C3AED"
        title="Reports"
        subtitle="Generate and export detailed reports in multiple formats"
        stats={[
          { label: 'Projects', value: totalProjects, color: 'bg-violet-500' },
          { label: 'Tasks', value: totalTasks, color: 'bg-blue-500' },
          { label: 'Completion', value: `${completionRate}%`, color: 'bg-green-500' },
          { label: 'Active Users', value: activeUsers, color: 'bg-amber-500' },
        ]}
        filterOptions={[
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' },
          { value: 'quarter', label: 'This Quarter' },
          { value: 'year', label: 'This Year' },
        ]}
        filterValue={filterType}
        onFilter={setFilterType}
        filterPlaceholder="Time Range"
      />

      {/* Report Generator */}
      <ReportGenerator />
    </div>
  );
};

export default Reports;