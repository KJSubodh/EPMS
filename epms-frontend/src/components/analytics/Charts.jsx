// src/components/analytics/Charts.jsx
import React from 'react';
import { Pie, Doughnut, Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Project Status Pie Chart
export const ProjectStatusChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = {
        labels: data.map(d => d.status),
        datasets: [
            {
                data: data.map(d => d.count),
                backgroundColor: data.map(d => d.color || '#9CA3AF'),
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Project Status Distribution</h3>
            <div className="h-64">
                <Pie data={chartData} options={options} />
            </div>
        </div>
    );
};

// Priority Distribution Doughnut Chart
export const PriorityDistributionChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = {
        labels: data.map(d => d.priority),
        datasets: [
            {
                data: data.map(d => d.count),
                backgroundColor: data.map(d => d.color || '#9CA3AF'),
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Priority Distribution</h3>
            <div className="h-64">
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
};

// Task Trend Line Chart
export const TaskTrendChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const chartData = {
        labels: data.map(d => d.date),
        datasets: [
            {
                label: 'Created',
                data: data.map(d => d.created),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Completed',
                data: data.map(d => d.completed),
                borderColor: '#22C55E',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'In Progress',
                data: data.map(d => d.inProgress),
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Task Trend (Last 30 Days)</h3>
            <div className="h-64">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

// Team Performance Bar Chart
export const TeamPerformanceChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const sorted = [...data].sort((a, b) => b.completed - a.completed).slice(0, 10);

    const chartData = {
        labels: sorted.map(d => d.fullName.split(' ')[0]),
        datasets: [
            {
                label: 'Completed',
                data: sorted.map(d => d.completed),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: '#22C55E',
                borderWidth: 1
            },
            {
                label: 'In Progress',
                data: sorted.map(d => d.inProgress),
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                borderColor: '#F59E0B',
                borderWidth: 1
            },
            {
                label: 'Overdue',
                data: sorted.map(d => d.overdue),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: '#EF4444',
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Team Performance</h3>
            <div className="h-64">
                <Bar data={chartData} options={options} />
            </div>
            <p className="text-xs text-gray-400 mt-2">Showing top 10 performers</p>
        </div>
    );
};