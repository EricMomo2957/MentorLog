import { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement,
    Title
);

// Updated interface with nested attendance details
interface SystemStats {
    announcements: number;
    attendance: number;
    events: number;
    feedbacks: number;
    requests: number; 
    tasks: number;
    users: number;
    attendanceDetails?: {
        present: number;
        late: number;
        absent: number;
    };
}

const ReportAnalytics = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/analytics/stats', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    // 1. General System Metrics Data
    const labels = ['Announcements', 'Attendance', 'Events', 'Feedbacks', 'Services', 'Tasks', 'Users'];
    const dataValues = [
        stats?.announcements || 0,
        stats?.attendance || 0,
        stats?.events || 0,
        stats?.feedbacks || 0,
        stats?.requests || 0,
        stats?.tasks || 0,
        stats?.users || 0
    ];

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'System Metrics',
            data: dataValues,
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)', // Blue
                'rgba(16, 185, 129, 0.8)', // Emerald
                'rgba(245, 158, 11, 0.8)', // Amber
                'rgba(239, 68, 68, 0.8)',  // Red
                'rgba(139, 92, 246, 0.8)', // Violet
                'rgba(236, 72, 153, 0.8)', // Pink
                'rgba(100, 116, 139, 0.8)' // Slate
            ],
            borderColor: '#1e293b',
            borderWidth: 2,
        }]
    };

    // 2. Attendance Specific Data
    const attendanceLabels = ['Present', 'Late', 'Absent'];
    const attendanceValues = [
        stats?.attendanceDetails?.present || 0,
        stats?.attendanceDetails?.late || 0,
        stats?.attendanceDetails?.absent || 0
    ];

    const attendanceChartData = {
        labels: attendanceLabels,
        datasets: [{
            label: 'Attendance Status',
            data: attendanceValues,
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)', // Emerald/Green for Present
                'rgba(245, 158, 11, 0.8)', // Amber/Yellow for Late
                'rgba(239, 68, 68, 0.8)',  // Red for Absent
            ],
            borderColor: '#1e293b',
            borderWidth: 2,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#94a3b8',
                    font: { family: 'Inter', weight: 'bold' as const }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: '#64748b' },
                grid: { color: 'rgba(51, 65, 85, 0.5)' }
            },
            x: {
                ticks: { color: '#64748b' },
                grid: { display: false }
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 text-white min-h-screen">
            {/* Header Section */}
            <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                    Reports & <span className="text-blue-500">Analytics</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                    Real-time system data overview
                </p>
            </div>

            {/* Visual Charts Section - 3 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Metrics Pie Chart */}
                <div className="bg-[#1e293b] p-8 rounded-[40px] border border-slate-800 shadow-2xl">
                    <h3 className="text-[11px] font-black uppercase tracking-widest mb-8 text-slate-400">Data Distribution Mix</h3>
                    <div className="h-72"> 
                        <Pie data={chartData} options={options} />
                    </div>
                </div>

                {/* Attendance Status Pie Chart */}
                <div className="bg-[#1e293b] p-8 rounded-[40px] border border-slate-800 shadow-2xl">
                    <h3 className="text-[11px] font-black uppercase tracking-widest mb-8 text-slate-400">Attendance Breakdown</h3>
                    <div className="h-72"> 
                        <Pie data={attendanceChartData} options={options} />
                    </div>
                </div>

                {/* Bar Chart Card */}
                <div className="bg-[#1e293b] p-8 rounded-[40px] border border-slate-800 shadow-2xl">
                    <h3 className="text-[11px] font-black uppercase tracking-widest mb-8 text-slate-400">Module Volume Comparison</h3>
                    <div className="h-72">
                        <Bar 
                            data={chartData} 
                            options={{
                                ...options, 
                                plugins: { 
                                    ...options.plugins, 
                                    legend: { display: false }
                                }
                            }} 
                        />
                    </div>
                </div>
            </div>

            {/* Detailed Stats Grid - Individual Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {labels.map((label, index) => (
                    <div key={label} className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 text-center hover:border-blue-500/50 transition-all group">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">{label}</p>
                        <p className="text-3xl font-black text-white group-hover:text-blue-500 transition-colors">
                            {dataValues[index]}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportAnalytics;