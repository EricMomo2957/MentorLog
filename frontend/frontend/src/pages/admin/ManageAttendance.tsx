import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
    Clock, CheckCircle2, AlertCircle, XCircle, Search, 
    Filter, Download, RefreshCw, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface AttendanceRecord {
    id: number;
    student_name: string;
    date: string;
    clock_in: string;
    clock_out: string | null;
    total_hours: number;
    status: 'Present' | 'Late' | 'Absent';
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
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const ManageAttendance = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [selectedRecords, setSelectedRecords] = useState<number[]>([]);

    const fetchAllAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get('/attendance/all');
            if (response.data?.success) {
                setRecords(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAttendance();
    }, []);

    const exportToCSV = () => {
        if (!records || records.length === 0) return;
        const headers = ['ID', 'Student Name', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status'];
        const rows = records.map(r => [
            r.id,
            `"${r.student_name || 'N/A'}"`,
            `"${r.date}"`,
            `"${r.clock_in}"`,
            `"${r.clock_out || 'Active'}"`,
            r.total_hours ? Number(r.total_hours).toFixed(2) : '0',
            `"${r.status}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `dtr_attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Present': 
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full"><CheckCircle2 className="w-3 h-3" /> Present</span>;
            case 'Late': 
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full"><AlertCircle className="w-3 h-3" /> Late</span>;
            default: 
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full"><XCircle className="w-3 h-3" /> Absent</span>;
        }
    };

    const filteredRecords = records.filter(r => {
        const matchesSearch = r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (r.date && r.date.includes(searchTerm));
        const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const toggleSelectAll = () => {
        if (selectedRecords.length === filteredRecords.length) {
            setSelectedRecords([]);
        } else {
            setSelectedRecords(filteredRecords.map(r => r.id));
        }
    };

    const toggleSelectRecord = (id: number) => {
        if (selectedRecords.includes(id)) {
            setSelectedRecords(prev => prev.filter(item => item !== id));
        } else {
            setSelectedRecords(prev => [...prev, id]);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Logs & Time Tracking</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time verification of intern clock-in/out timestamps and total hours</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchAllAttendance}
                        disabled={loading}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                        <span>Refresh Logs</span>
                    </button>

                    <button 
                        onClick={exportToCSV} 
                        disabled={records.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export DTR (CSV)</span>
                    </button>
                </div>
            </div>

            {/* Filter & Control Bar (Automoor Style) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                
                {/* Left Filter Pill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="All">Status: All Logs</option>
                            <option value="Present">Present</option>
                            <option value="Late">Late</option>
                            <option value="Absent">Absent</option>
                        </select>
                        <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5">
                        <span>Log Date</span>
                        <span className="text-slate-400">▾</span>
                    </button>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search student or date..."
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
                        Synchronizing time logs...
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs font-medium">
                        No attendance records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input 
                                            type="checkbox"
                                            checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4">Student Contact ↕</th>
                                    <th className="py-3 px-4">Log Date ↕</th>
                                    <th className="py-3 px-4">Clock In / Out ↕</th>
                                    <th className="py-3 px-4">Total Duration ↕</th>
                                    <th className="py-3 px-4">Status ↕</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredRecords.map((record) => {
                                    const avatarStyle = getAvatarStyle(record.id);
                                    const initials = getInitials(record.student_name);
                                    const isChecked = selectedRecords.includes(record.id);

                                    return (
                                        <tr key={record.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>
                                            <td className="py-3.5 px-4 text-center">
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelectRecord(record.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            
                                            {/* Student Column with Photo or Pastel Initial Avatar */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    {record.profile_pic ? (
                                                        <img 
                                                            src={getFullPicUrl(record.profile_pic)} 
                                                            alt={record.student_name} 
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                        />
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-tight">{record.student_name || 'System Student'}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">Log ID: #{record.id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Log Date */}
                                            <td className="py-3.5 px-4 font-mono text-slate-600">
                                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>

                                            {/* Clock In / Out */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-emerald-600" /> {record.clock_in}
                                                    </span>
                                                    <span className={`text-[10px] ${record.clock_out ? 'text-slate-500' : 'text-blue-600 font-semibold italic'}`}>
                                                        {record.clock_out ? `Out: ${record.clock_out}` : 'Active Session'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Total Duration */}
                                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                                                {record.total_hours ? `${Number(record.total_hours).toFixed(2)} HRS` : '---'}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(record.status)}
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
                        <span>out of {filteredRecords.length} attendance logs</span>
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

export default ManageAttendance;