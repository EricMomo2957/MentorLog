import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { Shield, Search, RefreshCw, Clock, User, HardDrive, LayoutGrid, Megaphone } from 'lucide-react';

interface AuditLog {
    id: number;
    admin_name: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
    module: string;
    details: string;
    ip_address: string;
    created_at: string;
}

const ManageAuditLog = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/audit-logs');
            const logData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setLogs(logData);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchLogs();
    }, []);

    const stats = useMemo(() => {
        return {
            // Matches "TASK MANAGEMENT"
            ojtTasks: logs.filter(l => 
                l.module?.toUpperCase().includes('TASK')
            ).length,
            
            // Matches "STUDENT MANAGEMENT" (Ensures Intern Logs count works)
            interns: logs.filter(l => 
                l.module?.toUpperCase().includes('STUDENT')
            ).length,
            
            announcements: logs.filter(l => 
                l.module?.toUpperCase().includes('ANNOUNCEMENT')
            ).length,

            calendar: logs.filter(l => 
                l.module?.toUpperCase().includes('CALENDAR')
            ).length,

            total: logs.length
        };
    }, [logs]);

    const filteredLogs = logs.filter(log => 
        ((log.admin_name || "System").toLowerCase()).includes(searchTerm.toLowerCase()) ||
        (log.details?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (log.module?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action: string) => {
        switch (action) {
            case 'DELETE': return 'text-red-500 border-red-500/20 bg-red-500/10';
            case 'CREATE': return 'text-[#00df9a] border-[#00df9a]/20 bg-[#00df9a]/10';
            case 'UPDATE': return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
            default: return 'text-slate-400 border-slate-700 bg-slate-800/50';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-slate-300 p-8 font-sans">
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">System Security</p>
                        </div>
                        <h1 className="text-5xl font-light text-white uppercase tracking-tighter">
                            Audit <span className="text-[#00df9a] font-black">Logs</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="FILTER BY ADMIN, ACTION, OR MODULE..." 
                                className="w-full bg-[#0d1424] border border-slate-800 pl-10 pr-4 py-3 text-[10px] uppercase tracking-widest text-white focus:border-[#00df9a] outline-none transition-all rounded-sm"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={fetchLogs}
                            className="p-3 bg-[#0d1424] border border-slate-800 hover:border-[#00df9a] text-slate-400 hover:text-[#00df9a] transition-all rounded-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                    <div className="bg-[#0d1424] border border-slate-800 p-4 rounded-sm">
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Total Actions</p>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-white">{stats.total}</span>
                            <LayoutGrid className="w-4 h-4 text-slate-700" />
                        </div>
                    </div>
                    

                    <div className="bg-[#0d1424] border border-slate-800 p-4 rounded-sm border-l-blue-500/50">
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Intern Logs</p>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-white">{stats.interns}</span>
                            <User className="w-4 h-4 text-blue-500/50" />
                        </div>
                    </div>

                    <div className="bg-[#0d1424] border border-slate-800 p-4 rounded-sm border-l-[#00df9a]/50">
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Announcements</p>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-white">{stats.announcements}</span>
                            <Megaphone className="w-4 h-4 text-[#00df9a]/50" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto bg-[#0d1424] border border-slate-800 rounded-sm shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111a2e] border-b border-slate-800">
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Administrator</th>
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Action</th>
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Module</th>
                                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-xs uppercase tracking-widest animate-pulse text-slate-500">
                                        Retrieving Secure Log Entries...
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-[#141d33] transition-colors group">
                                    <td className="p-5 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                                            <Clock className="w-3 h-3 text-blue-500/50" />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                <User className="w-3 h-3 text-slate-400" />
                                            </div>
                                            <span className="text-xs font-bold text-white uppercase">
                                                {log.admin_name || "System"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-2 py-1 text-[9px] font-black border rounded-xs ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            <HardDrive className="w-3 h-3 text-slate-600" />
                                            {log.module}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <p className="text-xs text-slate-400 italic group-hover:text-slate-200 transition-colors">
                                            "{log.details}"
                                        </p>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-xs uppercase tracking-widest text-slate-600">
                                        No activity recorded matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageAuditLog;