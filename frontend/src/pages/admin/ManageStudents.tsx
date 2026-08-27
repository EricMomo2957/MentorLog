import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { exportToCSV } from '../../utils/exportCsv';
import { 
    Search, Filter, Download, Edit2, Trash2, CheckCircle2, 
    XCircle, ChevronLeft, ChevronRight, X, UserPlus,
    Users, UserCheck, UserX, Clock, Eye, School, 
    Briefcase, User, ShieldCheck, Mail
} from 'lucide-react';

interface Student {
    id: number;
    full_name: string;
    member_title?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    id_number?: string;
    student_id: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    age?: number | string;
    gender?: string;
    civil_status?: string;
    address?: string;
    school_name?: string;
    course?: string;
    year_level?: string;
    it_position?: string;
    profile_pic?: string;
    ojt_hours_required: number;
    is_active: boolean;
    created_at?: string;
}

const IT_POSITIONS = [
    'Software Engineer / Developer',
    'Frontend Web Developer',
    'Backend Web Developer',
    'Full Stack Web Developer',
    'Mobile App Developer (iOS / Android)',
    'UI/UX Designer & Researcher',
    'Quality Assurance (QA) Tester / Software QA',
    'Data Analyst / Business Intelligence',
    'Data Scientist / AI & ML Engineer',
    'Database Administrator (DBA)',
    'DevOps & Cloud Infrastructure Engineer',
    'Cybersecurity / Information Security Specialist',
    'Network & Systems Administrator',
    'IT Technical Support & Helpdesk',
    'IT Technical Writer & Systems Analyst',
    'IT Project Manager / Scrum Master',
    'Administrator / OJT Supervisor',
    'Other IT Specialization'
];

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

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

const ManageStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    
    // View Detail Modal State
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

    // Edit Modal State
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/students');
            if (response.data?.success) setStudents(response.data.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
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
            const response = await api.put(`/admin/students/${editingStudent.id}`, editingStudent);

            if (response.data?.success) {
                setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
                setEditingStudent(null);
                alert("Student record updated successfully!");
            }
        } catch (error) { 
            console.error("Update Student Error:", error); 
            alert("Failed to update student record.");
        }
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
            (s.phone && s.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.student_id && s.student_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.id_number && s.id_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.school_name && s.school_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.it_position && s.it_position.toLowerCase().includes(searchTerm.toLowerCase()));
        
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

    const activeCount = students.filter(s => s.is_active).length;
    const disabledCount = students.filter(s => !s.is_active).length;
    const totalHoursRequired = students.reduce((acc, curr) => acc + (curr.ojt_hours_required || 0), 0);
    const totalCount = students.length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">OJT Intern Directory</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage enrolled OJT students, inspect full profile verification details, and edit records</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => alert("Student registration is managed via reference codes or the registration portal.")} 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Student</span>
                    </button>

                    <button 
                        onClick={() => {
                            if (!students.length) return;
                            const exportData = students.map(s => ({
                                ID: s.id,
                                Name: s.full_name,
                                'Student ID': s.student_id,
                                Email: s.email,
                                Course: s.course || 'N/A',
                                Position: s.it_position || 'N/A',
                                Status: s.is_active ? 'Active' : 'Inactive'
                            }));
                            exportToCSV('student_roster', exportData);
                        }} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
                        title="Export Directory to CSV"
                    >
                        <Download className="w-4 h-4 text-blue-600" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Status Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Active Interns */}
                <div 
                    onClick={() => setFilterStatus(filterStatus === 'Active' ? 'All' : 'Active')}
                    className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-xs active:scale-98 bg-[#f2f6f3] ${
                        filterStatus === 'Active' ? 'border-[#2d4a34] ring-2 ring-[#2d4a34]/20 shadow-xs' : 'border-[#d4e2d6] hover:border-[#b0c7b3]'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-[#e0ece2] border border-[#c0d6c3] text-[#2d4a34] flex items-center justify-center mb-2.5">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#486650] tracking-wider uppercase mb-1">
                        ACTIVE INTERNS
                    </span>
                    <span className="text-3xl font-black text-[#243c2a]">
                        {activeCount}
                    </span>
                </div>

                {/* Disabled Accounts */}
                <div 
                    onClick={() => setFilterStatus(filterStatus === 'Disabled' ? 'All' : 'Disabled')}
                    className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-xs active:scale-98 bg-[#faf2f4] ${
                        filterStatus === 'Disabled' ? 'border-[#9c4b60] ring-2 ring-[#9c4b60]/20 shadow-xs' : 'border-[#f3d7df] hover:border-[#e2b4c2]'
                    }`}
                >
                    <div className="w-11 h-11 rounded-xl bg-[#f6e1e6] border border-[#ebc8d1] text-[#9c4b60] flex items-center justify-center mb-2.5">
                        <UserX className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#995364] tracking-wider uppercase mb-1">
                        DISABLED ACCOUNTS
                    </span>
                    <span className="text-3xl font-black text-[#6e2f3e]">
                        {disabledCount}
                    </span>
                </div>

                {/* Target Hours */}
                <div 
                    onClick={() => setFilterStatus('All')}
                    className="bg-[#fcf8f1] border-[#f5e6d2] hover:border-[#e6cb9f] rounded-2xl border p-5 text-center flex flex-col items-center justify-center shadow-xs transition-all hover:shadow-xs cursor-pointer active:scale-98"
                >
                    <div className="w-11 h-11 rounded-xl bg-[#f8ead7] border border-[#edd6b6] text-[#996825] flex items-center justify-center mb-2.5">
                        <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#946e38] tracking-wider uppercase mb-1">
                        TARGET OJT HOURS
                    </span>
                    <span className="text-3xl font-black text-[#6e4614]">
                        {totalHoursRequired.toLocaleString()} <span className="text-xs font-bold text-[#946e38]">hrs</span>
                    </span>
                </div>

                {/* Total Students */}
                <div 
                    onClick={() => setFilterStatus('All')}
                    className="bg-[#f2f5f7] border-[#d8e0e4] hover:border-[#b3c2c9] rounded-2xl border p-5 text-center flex flex-col items-center justify-center shadow-xs transition-all hover:shadow-xs cursor-pointer active:scale-98"
                >
                    <div className="w-11 h-11 rounded-xl bg-[#e2eaed] border border-[#c7d5db] text-[#3d5a6c] flex items-center justify-center mb-2.5">
                        <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#4c6a7d] tracking-wider uppercase mb-1">
                        TOTAL INTERNS
                    </span>
                    <span className="text-3xl font-black text-[#263b48]">
                        {totalCount}
                    </span>
                </div>
            </div>

            {/* Filter & Control Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                
                {/* Left Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="All">Status: All Interns</option>
                            <option value="Active">Active</option>
                            <option value="Disabled">Disabled</option>
                        </select>
                        <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search student, school, ID, or IT track..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* SaaS Directory Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                                    <th className="py-3 px-4">Student Info & Photo</th>
                                    <th className="py-3 px-4">School & Course</th>
                                    <th className="py-3 px-4">IT Specialization</th>
                                    <th className="py-3 px-4">I.D / Student ID</th>
                                    <th className="py-3 px-4">Hours</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredStudents.map((student) => {
                                    const avatarStyle = getAvatarStyle(student.id);
                                    const initials = getInitials(student.full_name);
                                    const isChecked = selectedStudents.includes(student.id);
                                    const picUrl = student.profile_pic ? getFullPicUrl(student.profile_pic) : null;

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
                                            
                                            {/* Contact Column with Photo or Avatar */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    {picUrl ? (
                                                        <img 
                                                            src={picUrl} 
                                                            alt={student.full_name} 
                                                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                        />
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            {student.member_title && (
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{student.member_title}</span>
                                                            )}
                                                            <p className="font-bold text-slate-900 leading-tight">{student.full_name}</p>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 font-mono">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* School & Course */}
                                            <td className="py-3.5 px-4">
                                                <p className="font-bold text-slate-800 leading-tight">{student.school_name || 'School Unspecified'}</p>
                                                <p className="text-[11px] text-slate-500">{student.course || 'IT Track'} — {student.year_level || 'N/A'}</p>
                                            </td>

                                            {/* IT Specialization */}
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                                                    <Briefcase className="w-3 h-3 text-amber-600 shrink-0" />
                                                    {student.it_position || 'Software Engineer'}
                                                </span>
                                            </td>

                                            {/* Student ID */}
                                            <td className="py-3.5 px-4 font-mono text-slate-700">
                                                {student.id_number || student.student_id || 'NOT_SET'}
                                            </td>

                                            {/* OJT Hours */}
                                            <td className="py-3.5 px-4 font-mono">
                                                <span className="font-bold text-slate-900">{student.ojt_hours_required || 600}</span> <span className="text-slate-400 text-[10px]">hrs</span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <button onClick={() => toggleStatus(student.id)} className="cursor-pointer">
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
                                                    {/* VIEW DETAIL EYE BUTTON */}
                                                    <button 
                                                        onClick={() => setViewingStudent(student)}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                                        title="View Complete Verification Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    <button 
                                                        onClick={() => setEditingStudent(student)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                                        title="Edit Student Record"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>

                                                    <button 
                                                        onClick={() => handleDelete(student.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                                        title="Delete Student Account"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
                        <select className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                        <span>out of {filteredStudents.length} students</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50" disabled>
                            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-xs">1</button>
                        <button className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50" disabled>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 1. VIEW DETAILED STUDENT VERIFICATION MODAL --- */}
            {viewingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        
                        {/* Header */}
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Student Profile & Verification Card</h3>
                                <p className="text-xs text-slate-500">Complete registered info, personal identification, and academic track</p>
                            </div>
                            <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Top Hero Banner */}
                        <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-5">
                            {viewingStudent.profile_pic ? (
                                <img 
                                    src={getFullPicUrl(viewingStudent.profile_pic)} 
                                    alt={viewingStudent.full_name} 
                                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm shrink-0" 
                                />
                            ) : (
                                <div className={`w-20 h-20 rounded-full border-4 border-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-sm ${getAvatarStyle(viewingStudent.id)}`}>
                                    {getInitials(viewingStudent.full_name)}
                                </div>
                            )}

                            <div className="space-y-1.5 text-center sm:text-left flex-1">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    {viewingStudent.member_title && (
                                        <span className="text-xs font-bold text-slate-400 uppercase">{viewingStudent.member_title}</span>
                                    )}
                                    <h4 className="text-xl font-black text-slate-900">{viewingStudent.full_name}</h4>
                                    {viewingStudent.is_active ? (
                                        <span className="px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Active Intern
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full flex items-center gap-1">
                                            <XCircle className="w-3 h-3" /> Account Disabled
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                                    {viewingStudent.it_position && (
                                        <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-semibold flex items-center gap-1">
                                            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                                            {viewingStudent.it_position}
                                        </span>
                                    )}
                                    {viewingStudent.school_name && (
                                        <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg font-semibold flex items-center gap-1">
                                            <School className="w-3.5 h-3.5 text-purple-600" />
                                            {viewingStudent.school_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Grid Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            
                            {/* Personal Identification Card */}
                            <div className="p-4 bg-slate-50/60 border border-slate-200/80 rounded-2xl space-y-3">
                                <h5 className="font-bold text-emerald-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Personal Identification
                                </h5>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">I.D / Student Number</p>
                                        <p className="font-semibold font-mono text-slate-900">{viewingStudent.id_number || viewingStudent.student_id || 'Not Set'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Member Title</p>
                                        <p className="font-semibold text-slate-900">{viewingStudent.member_title || 'Mr.'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">First Name</p>
                                        <p className="font-semibold text-slate-900">{viewingStudent.first_name || viewingStudent.full_name.split(' ')[0]}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Middle Name</p>
                                        <p className="font-semibold text-slate-900">{viewingStudent.middle_name || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Last Name</p>
                                        <p className="font-semibold text-slate-900">{viewingStudent.last_name || viewingStudent.full_name.split(' ').slice(1).join(' ') || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</p>
                                        <p className="font-semibold text-slate-900">{viewingStudent.date_of_birth || 'Not Provided'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Age</p>
                                        <p className="font-extrabold text-emerald-600">{viewingStudent.age || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Sex / Gender</p>
                                        <p className="font-semibold text-slate-900">{viewingStudent.gender || 'Male'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Civil Status</p>
                                        <p className="font-semibold text-slate-900">{viewingStudent.civil_status || 'Single'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Location Card */}
                            <div className="p-4 bg-slate-50/60 border border-slate-200/80 rounded-2xl space-y-3">
                                <h5 className="font-bold text-blue-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> Contact & Address Info
                                </h5>

                                <div className="space-y-2.5">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                                        <p className="font-bold font-mono text-slate-900">{viewingStudent.email}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                                        <p className="font-bold font-mono text-slate-900">{viewingStudent.phone || 'Not Provided'}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Residential Address</p>
                                        <p className="font-semibold text-slate-800">{viewingStudent.address || 'Not Provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Track Card */}
                            <div className="p-4 bg-slate-50/60 border border-slate-200/80 rounded-2xl space-y-3">
                                <h5 className="font-bold text-purple-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <School className="w-3.5 h-3.5" /> Academic Track & School
                                </h5>

                                <div className="space-y-2.5">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Name of School / University</p>
                                        <p className="font-extrabold text-slate-900 text-sm">{viewingStudent.school_name || 'Not Provided'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Course / Program</p>
                                            <p className="font-semibold text-slate-900">{viewingStudent.course || 'BS Information Technology'}</p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Year Level</p>
                                            <p className="font-semibold text-slate-900">{viewingStudent.year_level || '4th Year'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* IT Track & OJT Hours Card */}
                            <div className="p-4 bg-slate-50/60 border border-slate-200/80 rounded-2xl space-y-3">
                                <h5 className="font-bold text-amber-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" /> IT Track & OJT Metrics
                                </h5>

                                <div className="space-y-2.5">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">IT Position Specialization</p>
                                        <p className="font-extrabold text-slate-900 text-sm">{viewingStudent.it_position || 'Software Engineer / Developer'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Required Hours</p>
                                            <p className="text-lg font-extrabold text-slate-900 font-mono">{viewingStudent.ojt_hours_required || 600} hrs</p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Registration Date</p>
                                            <p className="font-semibold text-slate-800">{viewingStudent.created_at ? new Date(viewingStudent.created_at).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <button 
                                onClick={() => setViewingStudent(null)} 
                                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                            >
                                Close Detail View
                            </button>

                            <button 
                                onClick={() => {
                                    setEditingStudent(viewingStudent);
                                    setViewingStudent(null);
                                }} 
                                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit This Record</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 2. EDIT STUDENT RECORD MODAL --- */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Update Student Record</h3>
                                <p className="text-xs text-slate-500">Edit complete intern verification details and academic track</p>
                            </div>
                            <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                            
                            {/* Personal Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="font-bold text-slate-700 mb-1 block">Member Title</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={editingStudent.member_title || 'Mr.'} 
                                        onChange={(e) => setEditingStudent({...editingStudent, member_title: e.target.value})}
                                    >
                                        <option value="Mr.">Mr.</option>
                                        <option value="Ms.">Ms.</option>
                                        <option value="Mrs.">Mrs.</option>
                                        <option value="Dr.">Dr.</option>
                                        <option value="Engr.">Engr.</option>
                                        <option value="Prof.">Prof.</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="font-bold text-slate-700 mb-1 block">Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={editingStudent.full_name} 
                                        onChange={(e) => setEditingStudent({...editingStudent, full_name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="font-bold text-slate-700 mb-1 block">I.D Number / Student ID</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white font-mono"
                                        value={editingStudent.id_number || editingStudent.student_id || ''} 
                                        onChange={(e) => setEditingStudent({...editingStudent, id_number: e.target.value, student_id: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 mb-1 block">Required OJT Hours</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white font-mono"
                                        value={editingStudent.ojt_hours_required} 
                                        onChange={(e) => setEditingStudent({...editingStudent, ojt_hours_required: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            {/* Contact & Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="font-bold text-slate-700 mb-1 block">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={editingStudent.email} 
                                        onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 mb-1 block">Phone Number</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={editingStudent.phone || ''} 
                                        onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 mb-1 block">Residential Address</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                    value={editingStudent.address || ''} 
                                    onChange={(e) => setEditingStudent({...editingStudent, address: e.target.value})}
                                />
                            </div>

                            {/* Academic & IT Track */}
                            <div>
                                <label className="font-bold text-slate-700 mb-1 block">Name of School / University</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                    value={editingStudent.school_name || ''} 
                                    onChange={(e) => setEditingStudent({...editingStudent, school_name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="font-bold text-slate-700 mb-1 block">Course / Degree Program</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={editingStudent.course || ''} 
                                        onChange={(e) => setEditingStudent({...editingStudent, course: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 mb-1 block">Year Level / Batch</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={editingStudent.year_level || ''} 
                                        onChange={(e) => setEditingStudent({...editingStudent, year_level: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 mb-1 block">IT Track Specialization</label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                    value={editingStudent.it_position || 'Software Engineer / Developer'} 
                                    onChange={(e) => setEditingStudent({...editingStudent, it_position: e.target.value})}
                                >
                                    {IT_POSITIONS.map((pos, idx) => (
                                        <option key={idx} value={pos}>{pos}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingStudent(null)} 
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2 bg-blue-600 rounded-xl text-white font-semibold text-xs hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
                                >
                                    Save Student Changes
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