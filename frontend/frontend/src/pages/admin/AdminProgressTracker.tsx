import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface InternProgress {
    student_id: string;
    full_name: string;
    total_hours_rendered: number;
    required_hours: number;
    latest_log_date: string;
    status: 'On Track' | 'At Risk' | 'Completed';
}

const AdminProgressTracker = () => {
    const [interns, setInterns] = useState<InternProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await api.get("/admin/intern-progress");
                const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
                setInterns(data);
            } catch (err) {
                console.error("Failed to load progress data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const filteredInterns = interns.filter(i => 
        i.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalInterns = interns.length;
    const completedInterns = interns.filter(i => i.status === 'Completed').length;

    return (
        <div className="max-w-7xl mx-auto space-y-8 text-slate-200">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Intern Performance Ledger</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Student OJT Hours Tracker</h1>
                    <p className="text-xs text-slate-400 mt-1">Monitor hourly progress, completion benchmarks, and attendance alerts.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                        <input 
                            type="text" 
                            placeholder="Search intern name..." 
                            className="bg-slate-900 border border-slate-800 pl-11 pr-4 py-3 text-xs text-white rounded-2xl focus:border-blue-500 outline-none transition-all w-64"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">Active Interns</p>
                        <p className="text-2xl font-black text-white mt-0.5">{totalInterns}</p>
                    </div>
                </div>
                <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">Completion Rate</p>
                        <p className="text-2xl font-black text-emerald-400 mt-0.5">{totalInterns > 0 ? Math.round((completedInterns/totalInterns)*100) : 0}%</p>
                    </div>
                </div>
                <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">At-Risk Interns</p>
                        <p className="text-2xl font-black text-red-400 mt-0.5">{interns.filter(i => i.status === 'At Risk').length}</p>
                    </div>
                </div>
            </div>

            {/* Progress Table */}
            <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-20 text-center text-xs text-slate-500 animate-pulse font-bold">
                        Synchronizing Intern Progress Data...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/60 border-b border-slate-800/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="p-5 pl-8">Student Name</th>
                                    <th className="p-5">Rendered Hours</th>
                                    <th className="p-5">Completion Progress</th>
                                    <th className="p-5">Last Activity</th>
                                    <th className="p-5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs">
                                {filteredInterns.length > 0 ? (
                                    filteredInterns.map((intern) => {
                                        const percent = Math.min((intern.total_hours_rendered / intern.required_hours) * 100, 100);
                                        
                                        return (
                                            <tr key={intern.student_id} className="hover:bg-slate-900/40 transition-colors">
                                                <td className="p-5 pl-8">
                                                    <p className="font-bold text-white text-sm">{intern.full_name}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: #{intern.student_id}</p>
                                                </td>
                                                <td className="p-5 font-mono">
                                                    <span className="text-blue-400 font-bold">{intern.total_hours_rendered}h</span> 
                                                    <span className="text-slate-500"> / {intern.required_hours}h</span>
                                                </td>
                                                <td className="p-5 w-64">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                                            <div 
                                                                className="h-full bg-linear-to-r from-blue-600 to-emerald-400 rounded-full transition-all duration-700"
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-400 font-mono">{Math.round(percent)}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-slate-400 font-mono text-[11px]">
                                                    {intern.latest_log_date ? new Date(intern.latest_log_date).toLocaleDateString() : 'No recent logs'}
                                                </td>
                                                <td className="p-5">
                                                    <span className={`px-3 py-1 text-[11px] font-bold rounded-xl border ${
                                                        intern.status === 'On Track' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' :
                                                        intern.status === 'At Risk' ? 'border-red-500/20 text-red-400 bg-red-500/10' :
                                                        'border-blue-500/20 text-blue-400 bg-blue-500/10'
                                                    }`}>
                                                        {intern.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-16 text-center text-xs text-slate-500 italic">
                                            No intern records found matching "{searchQuery}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProgressTracker;