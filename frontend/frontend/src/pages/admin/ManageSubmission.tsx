import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    FileText, CheckCircle2, XCircle, Clock, ExternalLink, 
    Edit2, Trash2, Search, Filter, Download, ChevronLeft, ChevronRight, X, Check
} from 'lucide-react';

interface Submission {
    id: number;
    student_name: string;
    document_type: string;
    status: string;
    file_path: string;
    submitted_at: string;
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

const ManageSubmission = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [selectedSubmissions, setSelectedSubmissions] = useState<number[]>([]);
    const [editingSub, setEditingSub] = useState<Submission | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/documents/all');
            setSubmissions(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch (_err) { 
            console.error("Fetch Error");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/documents/update/${id}`, { status, feedback: "" });
            fetchSubmissions();
        } catch (_err) {
            alert("Failed to update status");
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSub) return;
        try {
            const docType = (document.getElementById('edit_doc_type') as HTMLInputElement).value;
            await api.put(`/documents/edit/${editingSub.id}`, { document_type: docType });
            setEditingSub(null);
            fetchSubmissions();
        } catch (_err) {
            alert("Failed to update document");
        }
    };

    const getFileUrl = (filePath: string) => {
        if (!filePath) return '#';
        if (filePath.startsWith('http')) return filePath;
        const cleanPath = filePath.replace(/\\/g, '/');
        return cleanPath.startsWith('/') ? `http://localhost:5000${cleanPath}` : `http://localhost:5000/${cleanPath}`;
    };

    const deleteSubmission = async (id: number) => {
        if (!window.confirm("Permanent delete? This will also remove the physical file.")) return;
        try {
            await api.delete(`/documents/delete/${id}`);
            setSubmissions(submissions.filter(sub => sub.id !== id));
        } catch (_err) {
            alert("Delete failed");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': 
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
            case 'rejected': 
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full"><XCircle className="w-3 h-3" /> Rejected</span>;
            default: 
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
        }
    };

    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = sub.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            sub.document_type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || sub.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const toggleSelectAll = () => {
        if (selectedSubmissions.length === filteredSubmissions.length) {
            setSelectedSubmissions([]);
        } else {
            setSelectedSubmissions(filteredSubmissions.map(s => s.id));
        }
    };

    const toggleSelectSub = (id: number) => {
        if (selectedSubmissions.includes(id)) {
            setSelectedSubmissions(prev => prev.filter(item => item !== id));
        } else {
            setSelectedSubmissions(prev => [...prev, id]);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">OJT Document Submissions</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Verify and manage student intern compliance document submissions</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => alert("Exporting submissions report...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Submissions</span>
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
                            <option value="All">Status: All Files</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5">
                        <span>Submitted Date</span>
                        <span className="text-slate-400">▾</span>
                    </button>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search student or file..."
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
                        Loading student document submissions...
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs font-medium">
                        No submission records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input 
                                            type="checkbox"
                                            checked={selectedSubmissions.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4">Student Contact ↕</th>
                                    <th className="py-3 px-4">Document Type ↕</th>
                                    <th className="py-3 px-4">Date Submitted ↕</th>
                                    <th className="py-3 px-4">Review Status ↕</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredSubmissions.map((sub) => {
                                    const avatarStyle = getAvatarStyle(sub.id);
                                    const initials = getInitials(sub.student_name);
                                    const isChecked = selectedSubmissions.includes(sub.id);

                                    return (
                                        <tr key={sub.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>
                                            <td className="py-3.5 px-4 text-center">
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelectSub(sub.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            
                                            {/* Student Column with Photo or Pastel Initial Avatar */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    {sub.profile_pic ? (
                                                        <img 
                                                            src={getFullPicUrl(sub.profile_pic)} 
                                                            alt={sub.student_name} 
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                        />
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-tight">{sub.student_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">Ref ID: #{sub.id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Document Type */}
                                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                                    <span>{sub.document_type}</span>
                                                </div>
                                            </td>

                                            {/* Submitted At */}
                                            <td className="py-3.5 px-4 font-mono text-slate-600">
                                                {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(sub.status)}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => window.open(getFileUrl(sub.file_path), '_blank')}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-all"
                                                        title="View File"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </button>

                                                    {sub.status === 'pending' && (
                                                        <>
                                                            <button 
                                                                onClick={() => updateStatus(sub.id, 'approved')}
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                                                                title="Approve File"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => updateStatus(sub.id, 'rejected')}
                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                                                                title="Reject File"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    )}

                                                    <button 
                                                        onClick={() => setEditingSub(sub)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-all"
                                                        title="Edit Submission"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteSubmission(sub.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                                                        title="Delete Submission"
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
                        <span>out of {filteredSubmissions.length} submissions</span>
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
            {editingSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900">Modify Submission Category</h3>
                            <button onClick={() => setEditingSub(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Student Name</label>
                                <input 
                                    type="text" 
                                    disabled 
                                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 font-semibold"
                                    value={editingSub.student_name} 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Document Type / Category</label>
                                <input 
                                    type="text" 
                                    required 
                                    id="edit_doc_type"
                                    defaultValue={editingSub.document_type}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingSub(null)} 
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

export default ManageSubmission;