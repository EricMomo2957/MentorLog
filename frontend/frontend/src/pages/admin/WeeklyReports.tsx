import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, BarChart3, Clock, AlertTriangle } from 'lucide-react';

interface ReportData {
    student_name: string;
    total_hours: number;
    late_count: number;
    total_days: number;
}

const WeeklyReports = () => {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeeklyReport = async () => {
            try {
                const response = await api.get('/attendance/weekly-report');
                const result = response.data;
                if (result?.success && Array.isArray(result.data)) {
                    setReports(result.data);
                } else if (Array.isArray(result)) {
                    setReports(result);
                }
            } catch (error) {
                console.error("Error fetching weekly report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeeklyReport();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8 text-slate-200">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Weekly Telemetry</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Weekly Performance Summaries</h1>
                    <p className="text-xs text-slate-400 mt-1">Accumulated OJT working hours, attendance rates, and goal completion progress.</p>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-[#0f172a]/40 rounded-3xl animate-pulse border border-slate-800"></div>
                    ))
                ) : reports.length > 0 ? (
                    reports.map((report, index) => (
                        <div key={index} className="bg-[#0f172a]/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{report.student_name}</h3>
                                        <p className="text-slate-500 text-xs font-mono mt-0.5">{report.total_days} Days Active</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-blue-400 font-mono">
                                            {Number(report.total_hours).toFixed(1)}
                                            <span className="text-xs text-slate-500 font-normal ml-1">hrs</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar Container */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-500">Weekly Goal: 40h</span>
                                        <span className="text-blue-400 font-mono">{Math.min(Math.round((report.total_hours / 40) * 100), 100)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                        <div 
                                            className="bg-linear-to-r from-blue-600 via-blue-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                                            style={{ width: `${Math.min((report.total_hours / 40) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Stats */}
                            <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${report.late_count > 2 ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                                    <span className="text-xs font-bold text-slate-400">{report.late_count} Late Clock-Ins</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-[#0f172a]/70 p-16 rounded-3xl border border-slate-800/80 text-center text-slate-500 text-xs italic">
                        No performance data found for this week.
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeeklyReports;