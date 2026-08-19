// src/pages/Analytics.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDashboardSummary,
    fetchProjectStatus,
    fetchTaskTrend,
    fetchTeamPerformance,
    fetchPriorityDistribution
} from '../store/slices/analyticsSlice';
import PageHero from '../components/common/PageHero';
import KPICards from '../components/analytics/KPICards';
import {
    ProjectStatusChart,
    PriorityDistributionChart,
    TaskTrendChart,
    TeamPerformanceChart
} from '../components/analytics/Charts';
import { FaChartLine, FaSpinner, FaSync } from 'react-icons/fa';

const Analytics = () => {
    const dispatch = useDispatch();
    
    // ✅ Safe selector with fallback
    const analyticsState = useSelector((state) => state.analytics) || {};
    const {
        dashboardSummary = null,
        projectStatus = [],
        taskTrend = [],
        teamPerformance = [],
        priorityDistribution = [],
        isLoading = false
    } = analyticsState;
    
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            await Promise.all([
                dispatch(fetchDashboardSummary()),
                dispatch(fetchProjectStatus()),
                dispatch(fetchTaskTrend()),
                dispatch(fetchTeamPerformance()),
                dispatch(fetchPriorityDistribution())
            ]);
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
    };

    // Show loading state
    if (isLoading && !dashboardSummary) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3">
                    <FaSpinner className="w-6 h-6 text-[#7C3AED] animate-spin" />
                    <span className="text-sm text-gray-500">Loading analytics...</span>
                </div>
            </div>
        );
    }

    // Stats for PageHero
    const stats = [
        { label: 'Total Users', value: dashboardSummary?.totalUsers || 0, color: 'bg-blue-500' },
        { label: 'Active Projects', value: dashboardSummary?.activeProjects || 0, color: 'bg-green-500' },
        { label: 'Tasks Completed', value: dashboardSummary?.completedTasks || 0, color: 'bg-emerald-500' },
        { label: 'Completion Rate', value: `${dashboardSummary?.completionRate || 0}%`, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-6">
            {/* PageHero */}
            <PageHero
                icon={FaChartLine}
                iconColor="#7C3AED"
                title="Analytics Dashboard"
                subtitle="Get insights into your projects, tasks, and team performance"
                stats={stats}
            />

            {/* Refresh Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                >
                    <FaSync className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* KPI Cards */}
            <KPICards data={dashboardSummary} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProjectStatusChart data={projectStatus} />
                <PriorityDistributionChart data={priorityDistribution} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <TaskTrendChart data={taskTrend} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <TeamPerformanceChart data={teamPerformance} />
            </div>

            {/* Team Performance Table */}
            {teamPerformance && teamPerformance.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700">Detailed Team Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teamPerformance.slice(0, 10).map((user) => (
                                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {user.fullName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'PROJECT_MANAGER' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{user.totalAssigned}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-green-600">{user.completed}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${user.completionRate}%` }}
                                                    />
                                                </div>
                                                <span>{user.completionRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-red-600">{user.overdue}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {user.avgCompletionTime > 0 ? `${Math.round(user.avgCompletionTime)}h` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {teamPerformance.length > 10 && (
                        <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-200">
                            Showing top 10 of {teamPerformance.length} users
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Analytics;