import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

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

    const fetchStudents = useCallback(async () => {
        try {
            const response = await api.get('/admin/students');
            if (response.data?.success) setStudents(response.data.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleUpdate = async () => {
        if (!editingStudent) return;
        try {
            const response = await api.put(`/admin/students/${editingStudent.id}`, {
                full_name: editingStudent.full_name,
                student_id: editingStudent.student_id,
                ojt_hours_required: editingStudent.ojt_hours_required
            });

            if (response.data?.success) {
                setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
                setEditingStudent(null);
            }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Permanently delete this student account?")) return;
        try {
            const response = await api.delete(`/admin/students/${id}`);
            if (response.data?.success) setStudents(prev => prev.filter(s => s.id !== id));
        } catch (error) { console.error(error); }
    };

    const toggleStatus = (id: number) => {
        setStudents(prev => prev.map(s => 
            s.id === id ? { ...s, is_active: !s.is_active } : s
        ));
    };

    const filteredStudents = students.filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.student_id && s.student_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 font-mono animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-2 border-slate-800 pb-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-1.5 bg-blue-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Directory_Access_v2</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Manage <span className="text-slate-600 not-italic font-light">Students</span></h1>
                </div>

                <div className="relative group w-full lg:w-96">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[10px]">ID_SCAN:</div>
                    <input 
                        type="text" 
                        placeholder="INPUT NAME OR IDENTIFICATION..." 
                        className="w-full bg-black border border-slate-800 rounded-none pl-20 pr-5 py-4 text-[10px] font-bold text-white uppercase tracking-widest focus:border-blue-500 outline-none transition-all"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Container */}
            {loading ? (
                <div className="py-32 text-center text-slate-700 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Synchronizing_Datastream...</div>
            ) : filteredStudents.length === 0 ? (
                <div className="py-20 text-center text-slate-600 font-black text-[10px] uppercase border border-dashed border-slate-800">No_Matches_Found_In_Registry</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                        <div key={student.id} className="group relative bg-[#0a0f1d] border border-slate-800 p-6 transition-all hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(30,58,138,0.2)]">
                            {/* Card Top: Identity */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="text-[8px] font-black px-1.5 py-0.5 bg-slate-800 text-slate-400">UID_{student.id}</div>
                                        <div className={`h-1.5 w-1.5 rounded-full ${student.is_active ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`}></div>
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-blue-400 transition-colors">
                                        {student.full_name}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-500 truncate max-w-50">{student.email}</p>
                                </div>
                                <div className="w-12 h-12 bg-black border border-slate-800 flex items-center justify-center text-xl font-black text-slate-700 group-hover:text-blue-500 transition-all italic">
                                    {student.full_name.charAt(0)}
                                </div>
                            </div>

                            {/* Card Middle: Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-slate-800/50">
                                <div>
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Institutional_ID</p>
                                    <p className="text-xs font-black text-white">{student.student_id || 'NOT_SET'}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Required_OJT</p>
                                    <p className="text-xs font-black text-white">{student.ojt_hours_required} <span className="text-blue-500 text-[9px]">HRS</span></p>
                                </div>
                            </div>

                            {/* Card Bottom: Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-800/30">
                                <button 
                                    onClick={() => toggleStatus(student.id)}
                                    className={`text-[9px] font-black px-3 py-1.5 border transition-all ${
                                        student.is_active 
                                        ? 'border-emerald-900/50 text-emerald-500 hover:bg-emerald-500 hover:text-black' 
                                        : 'border-red-900/50 text-red-500 hover:bg-red-500 hover:text-black'
                                    }`}
                                >
                                    {student.is_active ? '[ ACTIVE ]' : '[ DISABLED ]'}
                                </button>
                                
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingStudent(student)} className="p-2 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-blue-500 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button onClick={() => handleDelete(student.id)} className="p-2 bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500/50 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Decorative corner accent */}
                            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-slate-700 group-hover:border-blue-500 transition-colors"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal (Keeping your existing logic/styles but with corrected z-indexes) */}
            {editingStudent && (
                <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
                    <div className="bg-[#020617] border-2 border-slate-800 w-full max-w-lg p-10 shadow-[0_0_80px_rgba(0,0,0,1)] relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500 -translate-x-1 -translate-y-1"></div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10 border-b-2 border-slate-800 pb-5">
                            Update_Master_<span className="text-blue-500">Record</span>
                        </h2>
                        <div className="space-y-8">
                             <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Identity_Name</label>
                                <input 
                                    type="text" 
                                    value={editingStudent.full_name} 
                                    onChange={(e) => setEditingStudent({...editingStudent, full_name: e.target.value})}
                                    className="w-full bg-transparent border-b border-slate-800 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all uppercase font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Registry_ID</label>
                                    <input 
                                        type="text" 
                                        value={editingStudent.student_id} 
                                        onChange={(e) => setEditingStudent({...editingStudent, student_id: e.target.value})}
                                        className="w-full bg-transparent border-b border-slate-800 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all uppercase font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Hour_Cap</label>
                                    <input 
                                        type="number" 
                                        value={editingStudent.ojt_hours_required} 
                                        onChange={(e) => setEditingStudent({...editingStudent, ojt_hours_required: Number(e.target.value)})}
                                        className="w-full bg-transparent border-b border-slate-800 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-12">
                            <button onClick={() => setEditingStudent(null)} className="flex-1 py-4 border border-slate-800 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-slate-900 transition-all">Abort_Changes</button>
                            <button onClick={handleUpdate} className="flex-2 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl">Commit_Registry</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;