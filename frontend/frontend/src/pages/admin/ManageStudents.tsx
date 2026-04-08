import { useState, useEffect } from 'react';

interface Student {
    id: number;
    full_name: string;
    student_id: string;
    email: string;
    ojt_hours_required: number;
    is_active: boolean;
}

const ManageStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/students', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            if (result.success) setStudents(result.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingStudent) return;
        try {
            const response = await fetch(`http://localhost:5000/api/admin/students/${editingStudent.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({
                    full_name: editingStudent.full_name,
                    student_id: editingStudent.student_id,
                    ojt_hours_required: editingStudent.ojt_hours_required
                })
            });

            if (response.ok) {
                setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
                setEditingStudent(null);
            }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Permanently delete this student account?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/admin/students/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) setStudents(students.filter(s => s.id !== id));
        } catch (error) { console.error(error); }
    };

    const toggleStatus = (id: number) => {
        setStudents(students.map(s => 
            s.id === id ? { ...s, is_active: !s.is_active } : s
        ));
    };

    const filteredStudents = students.filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {/* Top Bar */}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">User Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Student <span className="text-slate-500">Directory</span></h1>
                </div>

                <div className="relative group w-full lg:w-96">
                    <input 
                        type="text" 
                        placeholder="SEARCH BY NAME OR ID..." 
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3.5 text-[10px] font-bold text-white uppercase tracking-widest focus:border-blue-500 outline-none transition-all group-hover:border-slate-700"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-black group-focus-within:text-blue-500">CMD + F</div>
                </div>
            </div>

            {/* Student Ledger List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center text-slate-600 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Accessing Secure Records...</div>
                ) : filteredStudents.map((student) => (
                    <div key={student.id} className="bg-[#1e293b] rounded-2xl border border-slate-800/50 overflow-hidden hover:border-blue-500/30 transition-all shadow-sm group">
                        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                            
                            {/* Identity Section */}
                            <div className="lg:col-span-4 p-6 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-800/60">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-black text-blue-400 shadow-inner group-hover:text-white group-hover:bg-blue-600 transition-all">
                                    {student.full_name.charAt(0)}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-white font-black text-sm uppercase tracking-wider">{student.full_name}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{student.email}</p>
                                </div>
                            </div>

                            {/* Credentials Section */}
                            <div className="lg:col-span-3 p-6 flex flex-col justify-center gap-1 border-b lg:border-b-0 lg:border-r border-slate-800/60 bg-slate-900/10">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Institutional ID</span>
                                <span className="text-xs font-mono font-bold text-slate-300 tracking-tighter">{student.student_id || 'NOT_ASSIGNED'}</span>
                            </div>

                            {/* Metrics Section */}
                            <div className="lg:col-span-2 p-6 flex flex-col justify-center gap-1 border-b lg:border-b-0 lg:border-r border-slate-800/60">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">OJT Threshold</span>
                                <span className="text-sm font-black text-blue-500">{student.ojt_hours_required} <span className="text-[9px] text-slate-500">HRS</span></span>
                            </div>

                            {/* Status & Actions Section */}
                            <div className="lg:col-span-3 p-6 flex items-center justify-between lg:justify-end gap-6">
                                <button 
                                    onClick={() => toggleStatus(student.id)}
                                    className={`text-[9px] font-black px-4 py-1.5 rounded-lg border transition-all active:scale-95 ${
                                        student.is_active !== false 
                                        ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                                        : 'bg-red-500/5 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
                                    }`}
                                >
                                    {student.is_active !== false ? 'ACTIVE' : 'DISABLED'}
                                </button>
                                
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingStudent(student)} className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </button>
                                    <button onClick={() => handleDelete(student.id)} className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-500 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#020617]/95 backdrop-blur-md p-6">
                    <div className="bg-[#1e293b] border border-slate-800 w-full max-w-lg rounded-3xl p-10 shadow-3xl">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8 border-b border-slate-800 pb-4">
                            Update <span className="text-blue-500">Account</span>
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Legal Full Name</label>
                                <input 
                                    type="text" 
                                    value={editingStudent.full_name} 
                                    onChange={(e) => setEditingStudent({...editingStudent, full_name: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3.5 text-white text-xs outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Student ID #</label>
                                    <input 
                                        type="text" 
                                        value={editingStudent.student_id} 
                                        onChange={(e) => setEditingStudent({...editingStudent, student_id: e.target.value})}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3.5 text-white text-xs outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Required Hours</label>
                                    <input 
                                        type="number" 
                                        value={editingStudent.ojt_hours_required} 
                                        onChange={(e) => setEditingStudent({...editingStudent, ojt_hours_required: Number(e.target.value)})}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3.5 text-white text-xs outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setEditingStudent(null)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all">Cancel</button>
                            <button onClick={handleUpdate} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all">Save Records</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;