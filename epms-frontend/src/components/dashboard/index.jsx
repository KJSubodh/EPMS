// src/components/dashboard/index.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../../store/slices/projectSlice';
import { fetchTasks } from '../../store/slices/taskSlice';
import PageHero from '../common/PageHero';
import {
  FaProjectDiagram,
  FaTasks,
  FaUsers,
  FaCheckCircle,
  FaArrowRight,
  FaPlusCircle,
  FaChartLine,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaFolder,
  FaClipboardList,
  FaHome
} from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';

// Solid status color tokens
const STATUS = {
  DONE: { color: '#16A34A', label: 'Done' },
  IN_PROGRESS: { color: '#F59E0B', label: 'In Progress' },
  BLOCKED: { color: '#EF4444', label: 'Blocked' },
  REVIEW: { color: '#7C3AED', label: 'Review' },
  TODO: { color: '#3B82F6', label: 'To Do' },
  PLANNING: { color: '#3B82F6', label: 'Planning' },
  ACTIVE: { color: '#16A34A', label: 'Active' }
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { projects, isLoading: projectsLoading } = useSelector((state) => state.projects);
  const { tasks, isLoading: tasksLoading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchTasks());
  }, [dispatch]);

  // Calculate statistics
  const totalProjects = projects?.length || 0;
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'DONE').length || 0;
  const inProgressTasks = tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0;
  const blockedTasks = tasks?.filter(t => t.status === 'BLOCKED').length || 0;
  const otherTasks = totalTasks - completedTasks - inProgressTasks - blockedTasks;
  const overdueTasks = tasks?.filter(t => {
    if (t.status === 'DONE') return false;
    return new Date(t.dueDate) < new Date();
  }).length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Recent counts (last 7 days)
  const getRecentCount = (items, dateField = 'createdAt') => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return items?.filter(item => new Date(item[dateField]) >= sevenDaysAgo).length || 0;
  };

  const recentProjects = getRecentCount(projects);
  const recentTasks = getRecentCount(tasks);
  const recentCompleted = getRecentCount(tasks, 'updatedAt');

  const projectsTrend = recentProjects > 0 ? `+${recentProjects} this week` : 'No new projects';
  const tasksTrend = recentTasks > 0 ? `+${recentTasks} this week` : 'No new tasks';
  const completedTrend = recentCompleted > 0 ? `+${recentCompleted} completed` : 'No new completions';
  const overdueTrend = overdueTasks > 0 ? `${overdueTasks} overdue` : 'All on track';

  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects,
      color: 'bg-gray-700'
    },
    {
      label: 'Total Tasks',
      value: totalTasks,
      color: 'bg-blue-500'
    },
    {
      label: 'Completed',
      value: completedTasks,
      color: 'bg-green-500'
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      color: 'bg-red-500'
    }
  ];

  const statLinks = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: FaProjectDiagram,
      color: '#7C3AED',
      link: '/projects',
      change: projectsTrend
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: FaTasks,
      color: '#3B82F6',
      link: '/tasks',
      change: tasksTrend
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: FaCheckCircle,
      color: '#16A34A',
      link: '/tasks?status=DONE',
      change: `${completionRate}% rate · ${completedTrend}`
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: FaExclamationTriangle,
      color: '#EF4444',
      link: '/tasks?status=OVERDUE',
      change: overdueTrend
    }
  ];

  // Segmented bar breakdown
  const breakdown = [
    { key: 'DONE', label: 'Completed', value: completedTasks, color: STATUS.DONE.color },
    { key: 'IN_PROGRESS', label: 'In Progress', value: inProgressTasks, color: STATUS.IN_PROGRESS.color },
    { key: 'BLOCKED', label: 'Blocked', value: blockedTasks, color: STATUS.BLOCKED.color },
    { key: 'OTHER', label: 'Other', value: otherTasks, color: STATUS.TODO.color }
  ];
  const pct = (n) => (totalTasks > 0 ? (n / totalTasks) * 100 : 0);

  // Recent activity
  const recentActivities = [
    ...(projects || []).slice(0, 3).map(p => ({
      type: 'project',
      name: p.name,
      action: 'created',
      date: p.createdAt,
      status: p.status,
      link: `/projects/${p.id}`
    })),
    ...(tasks || []).slice(0, 3).map(t => ({
      type: 'task',
      name: t.title,
      action: t.status === 'DONE' ? 'completed' : 'updated',
      date: t.updatedAt || t.createdAt,
      status: t.status,
      link: `/tasks/${t.id}`,
      projectName: t.projectName
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const upcomingDeadlines = tasks
    ?.filter(t => t.status !== 'DONE' && new Date(t.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3) || [];

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PageHero - Now matches the dark theme */}
      <PageHero
        icon={FaHome}
        iconColor="#7C3AED"
        title={`Welcome back, ${user?.fullName?.split(' ')[0] || 'User'}`}
        subtitle={`${totalTasks} tasks across ${totalProjects} projects`}
        stats={stats}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {statLinks.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-[#7C3AED]/30 hover:shadow-[0_2px_12px_rgba(124,58,237,0.08)] transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${stat.color}12` }}
              >
                <stat.icon className="text-sm" style={{ color: stat.color }} />
              </div>
              <FaArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all mt-1" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3 font-mono">{stat.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{stat.title}</p>
            <p className="text-[10px] text-gray-400 mt-1.5">{stat.change}</p>
          </Link>
        ))}
      </div>

      {/* Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Task Distribution</h2>
            <Link to="/tasks" className="text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors">
              View all →
            </Link>
          </div>

          {/* Single segmented bar */}
          <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-gray-100">
            {breakdown.map((seg) => (
              <div
                key={seg.key}
                className="h-full transition-all duration-500"
                style={{ width: `${pct(seg.value)}%`, backgroundColor: seg.color }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {breakdown.map((seg) => (
              <div key={seg.key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 font-mono leading-tight">{seg.value}</p>
                  <p className="text-[11px] text-gray-500 truncate">{seg.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500 font-mono">
            <span>{totalTasks} total tasks</span>
            <span className="font-semibold text-gray-800">{completionRate}% complete</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
          <div className="space-y-1.5">
            {[
              { to: '/projects/new', icon: FaPlusCircle, label: 'New Project', color: '#7C3AED' },
              { to: '/tasks/new', icon: FaPlusCircle, label: 'New Task', color: '#3B82F6' },
              ...(user?.role === 'ADMIN'
                ? [{ to: '/admin/users', icon: FaUsers, label: 'Manage Users', color: '#F59E0B' }]
                : []),
              { to: '/reports', icon: FaChartLine, label: 'View Reports', color: '#16A34A' }
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-gray-200 hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 transition-all duration-200"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
                  <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                  {action.label}
                </span>
                <FaArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>

          {upcomingDeadlines.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
                <FaCalendarAlt className="text-gray-400 text-[11px]" />
                Upcoming Deadlines
              </h3>
              <div className="space-y-1.5">
                {upcomingDeadlines.map(task => (
                  <div key={task.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-700 truncate flex-1">{task.title}</span>
                    <span className="text-[10px] text-gray-400 ml-2 font-mono flex-shrink-0">
                      {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
          <Link to="/projects" className="text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors">
            View all →
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No recent activity</p>
        ) : (
          <div className="space-y-1.5">
            {recentActivities.map((activity, index) => {
              const meta = STATUS[activity.status] || STATUS.TODO;
              const TypeIcon = activity.type === 'project' ? FaFolder : FaClipboardList;
              return (
                <Link
                  to={activity.link}
                  key={index}
                  className="flex items-center gap-3 p-2.5 rounded-lg border-l-3 hover:bg-gray-50 transition-colors"
                  style={{ borderLeftColor: meta.color, borderLeftWidth: '3px' }}
                >
                  <TypeIcon className="text-gray-300 text-xs flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {activity.type === 'project' ? 'Project' : 'Task'} {activity.action}
                      {activity.projectName && ` in ${activity.projectName}`}
                      {' · '}
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded text-white flex-shrink-0 uppercase tracking-wide"
                    style={{ backgroundColor: meta.color }}
                  >
                    {meta.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;