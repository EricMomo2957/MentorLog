import { useState, useEffect } from 'react';
import axios from 'axios';

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
                const response = await axios.get("http://localhost:5000/api/admin/intern-progress");
                setInterns(response.data);
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
        <div className="min-h-screen bg-[#0a0f1c] text-slate-300 p-8 font-sans">
            {/* --- HEADER --- */}
            <div className="max-w-350 mx-auto mb-10">
                <div className="flex justify-between items-end border-b border-slate-800 pb-8">
                    <div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mb-2 text-glow">Administrative Control</p>
                        <h1 className="text-5xl font-light text-white uppercase tracking-tighter">
                            Intern <span className="text-[#00df9a] font-black">Progress</span>
                        </h1>
                    </div>
                    
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            placeholder="SEARCH INTERN NAME..." 
                            className="bg-[#0d1424] border border-slate-800 px-4 py-2 text-xs uppercase tracking-widest text-white focus:border-[#00df9a] outline-none transition-all placeholder:text-slate-600"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="bg-[#1a253d] border border-slate-700 px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 text-white">
                            Export Report
                        </button>
                    </div>
                </div>

                {/* --- QUICK STATS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-[#0d1424] border border-slate-800 p-6 rounded-sm">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Active Interns</p>
                        <p className="text-3xl font-light text-white">{totalInterns}</p>
                    </div>
                    <div className="bg-[#0d1424] border border-slate-800 p-6 rounded-sm">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Completion Rate</p>
                        <p className="text-3xl font-light text-[#00df9a]">{totalInterns > 0 ? Math.round((completedInterns/totalInterns)*100) : 0}%</p>
                    </div>
                    <div className="bg-[#0d1424] border border-slate-800 p-6 rounded-sm">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">At Risk Status</p>
                        <p className="text-3xl font-light text-red-500">{interns.filter(i => i.status === 'At Risk').length}</p>
                    </div>
                </div>
            </div>

            {/* --- PROGRESS TABLE --- */}
            <div className="max-w-350 mx-auto bg-[#0d1424] border border-slate-800 rounded-sm overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-20 text-center uppercase tracking-[0.5em] text-xs text-slate-500 animate-pulse">
                        Synchronizing Intern Data...
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111a2e] border-b border-slate-800">
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Student Name</th>
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Hours</th>
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Visual Progress</th>
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Last Activity</th>
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInterns.length > 0 ? (
                                filteredInterns.map((intern) => {
                                    const percent = Math.min((intern.total_hours_rendered / intern.required_hours) * 100, 100);
                                    
                                    return (
                                        <tr key={intern.student_id} className="border-b border-slate-800 hover:bg-[#141d33] transition-colors group">
                                            <td className="p-5">
                                                <p className="font-bold text-white text-sm uppercase tracking-tight">{intern.full_name}</p>
                                                <p className="text-[9px] text-slate-600 font-mono">ID: {intern.student_id}</p>
                                            </td>
                                            <td className="p-5 text-xs text-slate-400">
                                                <span className="text-[#00df9a] font-bold font-mono">{intern.total_hours_rendered}h</span> 
                                                <span className="text-slate-600"> / {intern.required_hours}h</span>
                                            </td>
                                            <td className="p-5 w-75">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-0.5 bg-slate-800 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-linear-to-r from-blue-600 to-[#00df9a] transition-all duration-1000 shadow-[0_0_8px_#00df9a44]"
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 font-mono">{Math.round(percent)}%</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-[10px] font-bold text-slate-500 uppercase">
                                                {intern.latest_log_date ? new Date(intern.latest_log_date).toLocaleDateString() : 'NO LOGS'}
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-sm border ${
                                                    intern.status === 'On Track' ? 'border-[#00df9a]/30 text-[#00df9a] bg-[#00df9a]/5' :
                                                    intern.status === 'At Risk' ? 'border-red-500/30 text-red-500 bg-red-500/5' :
                                                    'border-blue-500/30 text-blue-500 bg-blue-500/5'
                                                }`}>
                                                    {intern.status}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button className="text-[10px] font-black text-slate-500 hover:text-[#00df9a] uppercase tracking-widest transition-all group-hover:-translate-x-1">
                                                    View Details →
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-xs uppercase tracking-widest text-slate-600">
                                        No intern records found matching "{searchQuery}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminProgressTracker;