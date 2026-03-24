import { useEffect, useState } from 'react';

interface AttendanceRecord {
    id: number;
    student_name: string;
    date: string;
    clock_in: string;
    clock_out: string | null;
    total_hours: number;
    status: 'Present' | 'Late' | 'Absent';
}

const ManageAttendance = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllAttendance = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/attendance/all', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            if (result.success) {
                setRecords(result.data);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Late': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Student Attendance</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Monitor and manage all student time logs in real-time.</p>
                </div>
                <button 
                    onClick={fetchAllAttendance}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                    <span className="text-lg">🔄</span> Refresh Logs
                </button>
            </div>

            {/* Attendance Table */}
            <div className="bg-[#0f172a]/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/50">
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Student Name</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Date</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Clock In</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Clock Out</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Duration</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4 bg-slate-800/10 h-12"></td>
                                    </tr>
                                ))
                            ) : records.length > 0 ? (
                                records.map((record) => (
                                    <tr key={record.id} className="hover:bg-blue-500/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
                                                    {record.student_name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-200 group-hover:text-white">{record.student_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-emerald-400/80 font-mono font-bold">{record.clock_in}</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-mono italic">
                                            {record.clock_out || 'Session Active...'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-300">
                                            {record.total_hours ? `${Number(record.total_hours).toFixed(2)} hrs` : '--'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-tighter ${getStatusColor(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium italic">
                                        No attendance records found in the database.
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

export default ManageAttendance;