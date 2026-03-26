import { useState, useEffect } from 'react';

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
                const response = await fetch('http://localhost:5000/api/attendance/weekly-report', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const result = await response.json();
                if (result.success) {
                    setReports(result.data);
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
        <div className="space-y-8 p-2">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Weekly Performance</h1>
                <p className="text-slate-400 mt-2 font-medium">Summary of total OJT hours accumulated this week.</p>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Skeleton Loading State
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-800/20 rounded-3xl animate-pulse border border-slate-800"></div>
                    ))
                ) : reports.length > 0 ? (
                    reports.map((report, index) => (
                        <div key={index} className="bg-[#0f172a]/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl hover:border-blue-500/50 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{report.student_name}</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{report.total_days} Days Active</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-blue-400 italic">
                                        {Number(report.total_hours).toFixed(1)}
                                        <span className="text-[10px] text-slate-500 ml-1 uppercase not-italic">hrs</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">Weekly Goal: 40h</span>
                                    <span className="text-blue-400">{Math.min(Math.round((report.total_hours / 40) * 100), 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                                    <div 
                                        className="bg-linear-to-r from-blue-600 via-blue-400 to-emerald-500 h-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((report.total_hours / 40) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Footer Stats */}
                            <div className="mt-8 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${report.late_count > 2 ? 'bg-red-500 shadow-red-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}></div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{report.late_count} Late Arrivals</span>
                                </div>
                                <button className="text-[10px] font-black text-blue-500 hover:text-blue-300 tracking-widest uppercase transition-colors">
                                    Details →
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-slate-500 italic font-medium">No performance data found for this week.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeeklyReports;