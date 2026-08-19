// src/components/analytics/KPICards.jsx
import React from 'react';
import { 
    FaUsers, 
    FaProjectDiagram, 
    FaTasks, 
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaChartLine
} from 'react-icons/fa';

const KPICards = ({ data }) => {
    // ✅ Return null if no data
    if (!data) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            label: 'Total Users',
            value: data.totalUsers || 0,
            icon: FaUsers,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            subtext: `${data.activeUsers || 0} active`
        },
        {
            label: 'Active Projects',
            value: data.activeProjects || 0,
            icon: FaProjectDiagram,
            color: 'text-green-500',
            bg: 'bg-green-50',
            subtext: `${data.completedProjects || 0} completed`
        },
        {
            label: 'Tasks Completed',
            value: data.completedTasks || 0,
            icon: FaCheckCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            subtext: `${data.completionRate || 0}% rate`
        },
        {
            label: 'In Progress',
            value: data.inProgressTasks || 0,
            icon: FaClock,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            subtext: `${data.blockedTasks || 0} blocked`
        },
        {
            label: 'Overdue',
            value: data.overdueTasks || 0,
            icon: FaExclamationTriangle,
            color: 'text-red-500',
            bg: 'bg-red-50',
            subtext: 'Needs attention'
        },
        {
            label: 'This Week',
            value: data.tasksCompletedThisWeek || 0,
            icon: FaChartLine,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            subtext: `${data.tasksCreatedThisWeek || 0} created`
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                                <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg}`}>
                                <Icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KPICards;