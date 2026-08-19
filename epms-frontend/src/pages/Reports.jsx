// src/pages/Reports.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PageHero from '../components/common/PageHero';
import ReportGenerator from '../components/reports/ReportGenerator';
import { FaChartBar } from 'react-icons/fa';

// Same rolling-window semantics as ReportGenerator.jsx - kept in sync so the
// hero stats above the report always match what Generate will produce.
const getRangeStartDate = (range) => {
  const start = new Date();
  switch (range) {
    case 'week':
      start.setDate(start.getDate() - 7);
      return start;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      return start;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      return start;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      return start;
    default:
      return null;
  }
};

const Reports = () => {
  const { user } = useSelector((state) => state.auth);
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.admin);
  
  const [filterType, setFilterType] = useState('month');

  // Filter projects/tasks by the selected range before computing stats -
  // previously these stats were computed from the full unfiltered arrays
  // regardless of what the dropdown said, so the header numbers never
  // matched the report you were about to generate.
  const rangeStart = getRangeStartDate(filterType);
  const inRange = (dateStr) => {
    if (!rangeStart) return true;
    if (!dateStr) return false;
    return new Date(dateStr) >= rangeStart;
  };

  const filteredProjects = (projects || []).filter(p => inRange(p.createdAt));
  const filteredTasks = (tasks || []).filter(t => inRange(t.createdAt));

  const totalProjects = filteredProjects.length;
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  // Active user count is a current-state metric, not tied to the reporting
  // period, so it's intentionally left unfiltered.
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
      <ReportGenerator dateRange={filterType} />
    </div>
  );
};

export default Reports;