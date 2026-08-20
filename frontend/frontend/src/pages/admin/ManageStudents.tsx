import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { 
    Search, Filter, Download, Edit2, Trash2, CheckCircle2, 
    XCircle, ChevronLeft, ChevronRight, X, UserPlus
} from 'lucide-react';

interface Student {
    id: number;
    full_name: string;
    student_id: string;
    email: string;
    ojt_hours_required: number;
    is_active: boolean;
}

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
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const ManageStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/students');
            if (response.data?.success) setStudents(response.data.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
        } fontally: {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
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
        if (!window.confirm("Permanently delete this intern account?")) return;
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

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.student_id && s.student_id.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = filterStatus === 'All' || 
            (filterStatus === 'Active' && s.is_active) || 
            (filterStatus === 'Disabled' && !s.is_active);

        return matchesSearch && matchesStatus;
    });

    const toggleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s.id));
        }
    };

    const toggleSelectStudent = (id: number) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(prev => prev.filter(item => item !== id));
        } else {
            setSelectedStudents(prev => [...prev, id]);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Interns & Students</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Directory of registered student interns and required OJT hours</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => alert("Student registration is managed via reference codes or registration portal.")} 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Register Intern</span>
                    </button>

                    <button 
                        onClick={() => alert("Exporting student directory...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2.5 rounded-lg shadow-xs transition-all"
                        title="Export Directory"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filter & Control Bar (Automoor Style) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                
                {/* Left Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="All">Status: All Interns</option>
                            <option value="Active">Active</option>
                            <option value="Disabled">Disabled</option>
                        </select>
                        <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5">
                        <span>Course / Year</span>
                        <span className="text-slate-400">▾</span>
                    </button>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search student or ID..."
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
                        Loading student directory...
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs font-medium">
                        No student records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input 
                                            type="checkbox"
                                            checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4">Student Contact ↕</th>
                                    <th className="py-3 px-4">Student ID ↕</th>
                                    <th className="py-3 px-4">OJT Required Hours ↕</th>
                                    <th className="py-3 px-4">Account Status ↕</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredStudents.map((student) => {
                                    const avatarStyle = getAvatarStyle(student.id);
                                    const initials = getInitials(student.full_name);
                                    const isChecked = selectedStudents.includes(student.id);

                                    return (
                                        <tr key={student.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>
                                            <td className="py-3.5 px-4 text-center">
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelectStudent(student.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            
                                            {/* Contact Column with Pastel Initial Avatar */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-tight">{student.full_name}</p>
                                                        <p className="text-[11px] text-slate-400 font-mono">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Student ID */}
                                            <td className="py-3.5 px-4 font-mono text-slate-700">
                                                {student.student_id || 'NOT_SET'}
                                            </td>

                                            {/* OJT Hours */}
                                            <td className="py-3.5 px-4">
                                                <span className="font-semibold text-slate-800">{student.ojt_hours_required || 600}</span> <span className="text-slate-400 text-[10px]">HRS</span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <button onClick={() => toggleStatus(student.id)}>
                                                    {student.is_active ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                                                            <CheckCircle2 className="w-3 h-3" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full">
                                                            <XCircle className="w-3 h-3" /> Disabled
                                                        </span>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => setEditingStudent(student)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-all"
                                                        title="Edit Student"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(student.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                                                        title="Delete Student"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
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
                        <span>out of {filteredStudents.length} students</span>
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

            {/* Clean Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900">Update Student Record</h3>
                            <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Student Full Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                    value={editingStudent.full_name} 
                                    onChange={(e) => setEditingStudent({...editingStudent, full_name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Student ID</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white font-mono"
                                        value={editingStudent.student_id || ''} 
                                        onChange={(e) => setEditingStudent({...editingStudent, student_id: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Required OJT Hours</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={editingStudent.ojt_hours_required} 
                                        onChange={(e) => setEditingStudent({...editingStudent, ojt_hours_required: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingStudent(null)} 
                                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold text-xs hover:bg-blue-700 transition-all shadow-xs"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;