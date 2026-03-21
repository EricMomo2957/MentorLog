import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

interface ReportData {
    student_name: string;
    total_hours: number;
    late_count: number;
    total_days: number;
}

const WeeklyReports = () => {
    const [reports, setReports] = useState<ReportData[]>([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/attendance/weekly-report')
            .then(res => res.json())
            .then(res => {
                if (res.success) setReports(res.data);
            });
    }, []);

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Weekly Performance Report</h1>
                <p className="text-slate-400 mt-2">Summary of total OJT hours accumulated this week.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report, index) => (
                    <div key={index} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{report.student_name}</h3>
                                <p className="text-slate-400 text-sm">{report.total_days} Days active this week</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-blue-400">
                                    {Number(report.total_hours).toFixed(1)}
                                </span>
                                <span className="text-xs text-slate-500 ml-1 uppercase">hrs</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-400">Weekly Target: 40h</span>
                                <span className="text-blue-400">{Math.round((report.total_hours / 40) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                                <div 
                                    className="bg-linear-to-r from-blue-500 to-emerald-500 h-full transition-all duration-1000"
                                    style={{ width: `${Math.min((report.total_hours / 40) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                            <span className="text-sm text-slate-400 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${report.late_count > 2 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                {report.late_count} Late arrivals
                            </span>
                            <button className="text-xs font-bold text-blue-400 hover:underline">VIEW LOGS</button>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
};

export default WeeklyReports;