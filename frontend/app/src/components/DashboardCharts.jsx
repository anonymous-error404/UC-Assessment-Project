import { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { issuesAPI } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardCharts() {
    const [priorityData, setPriorityData] = useState(null);
    const [projectData, setProjectData] = useState(null);

    const fetchChartData = async () => {
        try {
            const [priRes, projRes] = await Promise.all([
                issuesAPI.getPriorityCounts(),
                issuesAPI.getProjectCounts(),
            ]);

            // Priority doughnut
            const priItems = priRes.data || [];
            setPriorityData({
                labels: priItems.map(i => i.priority),
                datasets: [{
                    data: priItems.map(i => parseInt(i.count, 10)),
                    backgroundColor: priItems.map(i => {
                        const colors = { Low: '#3b82f6', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };
                        return colors[i.priority] || '#6366f1';
                    }),
                    borderWidth: 0,
                    hoverOffset: 6,
                }],
            });

            // Project bar
            const projItems = projRes.data || [];
            setProjectData({
                labels: projItems.map(i => i.Project?.name || 'Unknown'),
                datasets: [{
                    label: 'Issues',
                    data: projItems.map(i => parseInt(i.count, 10)),
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: '#6366f1',
                    borderWidth: 1,
                    borderRadius: 6,
                    maxBarThickness: 50,
                }],
            });
        } catch {
            // non-critical
        }
    };

    useEffect(() => {
        fetchChartData();
    }, []);

    // Real-time updates
    useSocket({
        'issues:changed': () => fetchChartData(),
    });

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 16,
                    font: { family: 'Inter', size: 12 },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { family: 'Inter' },
                bodyFont: { family: 'Inter' },
                cornerRadius: 8,
                padding: 10,
            },
        },
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            x: {
                ticks: {
                    font: { family: 'Inter', size: 11 },
                },
                grid: { display: false },
                border: { display: false },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: { family: 'Inter', size: 11 },
                    stepSize: 1,
                },
                grid: {
                    color: 'rgba(128,128,128,0.1)',
                },
                border: { display: false },
            },
        },
    };

    return (
        <div className="charts-row">
            <div className="chart-card">
                <h3 className="chart-title">Issues by Priority</h3>
                <div className="chart-container chart-container-sm">
                    {priorityData ? (
                        <Doughnut data={priorityData} options={chartOptions} />
                    ) : (
                        <div className="page-loader"><div className="spinner"></div></div>
                    )}
                </div>
            </div>
            <div className="chart-card">
                <h3 className="chart-title">Issues by Project</h3>
                <div className="chart-container">
                    {projectData ? (
                        <Bar data={projectData} options={barOptions} />
                    ) : (
                        <div className="page-loader"><div className="spinner"></div></div>
                    )}
                </div>
            </div>
        </div>
    );
}
