import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Search, RefreshCw, Clock, HardDrive, 
    Filter, Download, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface AuditLog {
    id: number;
    admin_name: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
    module: string;
    details: string;
    ip_address: string;
    created_at: string;
    profile_pic?: string;
}

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

const pastelAvatarStyles = [
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
];
const getAvatarStyle = (id: number) => pastelAvatarStyles[id % pastelAvatarStyles.length];

const getInitials = (name?: string) => {
    if (!name) return 'SYS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const ManageAuditLog = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAction, setFilterAction] = useState<string>("All");
    const [selectedLogs, setSelectedLogs] = useState<number[]>([]);

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

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'DELETE': return <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full">DELETE</span>;
            case 'CREATE': return <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">CREATE</span>;
            case 'UPDATE': return <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">UPDATE</span>;
            case 'LOGIN': return <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full">LOGIN</span>;
            case 'CLOCK_IN': return <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full">CLOCK_IN</span>;
            case 'CLOCK_OUT': return <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">CLOCK_OUT</span>;
            default: return <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-full">{action}</span>;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = ((log.admin_name || "System").toLowerCase()).includes(searchTerm.toLowerCase()) ||
            (log.details?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (log.module?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'All' || log.action === filterAction;
        return matchesSearch && matchesAction;
    });

    const toggleSelectAll = () => {
        if (selectedLogs.length === filteredLogs.length) {
            setSelectedLogs([]);
        } else {
            setSelectedLogs(filteredLogs.map(l => l.id));
        }
    };

    const toggleSelectLog = (id: number) => {
        if (selectedLogs.includes(id)) {
            setSelectedLogs(prev => prev.filter(item => item !== id));
        } else {
            setSelectedLogs(prev => [...prev, id]);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Audit Logs</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Security audit trail of administrator actions, module changes, and system events</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchLogs}
                        disabled={loading}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                        <span>Refresh Logs</span>
                    </button>

                    <button 
                        onClick={() => alert("Exporting audit logs...")} 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Logs</span>
                    </button>
                </div>
            </div>

            {/* Filter & Control Bar (Automoor Style) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                
                {/* Left Filter Pill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <select 
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="All">Action: All Actions</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                            <option value="LOGIN">LOGIN</option>
                            <option value="CLOCK_IN">CLOCK_IN</option>
                            <option value="CLOCK_OUT">CLOCK_OUT</option>
                        </select>
                        <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5">
                        <span>Timestamp</span>
                        <span className="text-slate-400">▾</span>
                    </button>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search admin, action, or details..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* SaaS Table Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-slate-400 text-xs font-medium animate-pulse">
                        Retrieving security log entries...
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs font-medium">
                        No audit log entries found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input 
                                            type="checkbox"
                                            checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4">Timestamp ↕</th>
                                    <th className="py-3 px-4">Administrator ↕</th>
                                    <th className="py-3 px-4">Action ↕</th>
                                    <th className="py-3 px-4">Module ↕</th>
                                    <th className="py-3 px-4">Action Details ↕</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredLogs.map((log) => {
                                    const avatarStyle = getAvatarStyle(log.id);
                                    const initials = getInitials(log.admin_name);
                                    const isChecked = selectedLogs.includes(log.id);

                                    return (
                                        <tr key={log.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>
                                            <td className="py-3.5 px-4 text-center">
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelectLog(log.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>

                                            {/* Timestamp */}
                                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                    <span>{new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>

                                            {/* Admin Contact with Photo or Pastel Initial Avatar */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    {log.profile_pic ? (
                                                        <img 
                                                            src={getFullPicUrl(log.profile_pic)} 
                                                            alt={log.admin_name} 
                                                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                        />
                                                    ) : (
                                                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-slate-900">{log.admin_name || "System"}</span>
                                                </div>
                                            </td>

                                            {/* Action Badge */}
                                            <td className="py-3.5 px-4">
                                                {getActionBadge(log.action)}
                                            </td>

                                            {/* Module */}
                                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                                                <div className="flex items-center gap-1.5">
                                                    <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{log.module}</span>
                                                </div>
                                            </td>

                                            {/* Details */}
                                            <td className="py-3.5 px-4 max-w-sm">
                                                <p className="text-slate-600 text-xs italic font-medium leading-snug">
                                                    "{log.details}"
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Table Footer Pagination */}
                <div className="bg-slate-50/50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <span>Displaying</span>
                        <select className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 outline-none">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                        <span>out of {filteredLogs.length} audit entries</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button className="p-1 rounded border border-slate-200 hover:bg-white disabled:opacity-50" disabled>
                            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-xs">1</button>
                        <button className="p-1 rounded border border-slate-200 hover:bg-white disabled:opacity-50" disabled>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAuditLog;