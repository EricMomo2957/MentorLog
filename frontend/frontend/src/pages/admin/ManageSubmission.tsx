import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiFileText, FiCheck, FiX, FiEdit3, FiTrash2, FiExternalLink, 
    FiClock, FiCheckCircle 
} from 'react-icons/fi';

interface Submission {
    id: number;
    student_name: string;
    document_type: string;
    status: string;
    file_path: string;
    submitted_at: string;
}

const ManageSubmission = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSub, setEditingSub] = useState<Submission | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/documents/all');
            setSubmissions(res.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) { 
            console.error("Fetch Error");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await axios.put(`http://localhost:5000/api/documents/update/${id}`, { status, feedback: "" });
            fetchSubmissions();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
            alert("Failed to update status");
        }
    };

    const handleEdit = async () => {
        if (!editingSub) return;
        try {
            const docType = (document.getElementById('edit_doc_type') as HTMLInputElement).value;
            await axios.put(`http://localhost:5000/api/documents/edit/${editingSub.id}`, { document_type: docType });
            setEditingSub(null);
            fetchSubmissions();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
            alert("Failed to update document");
        }
    };

    const deleteSubmission = async (id: number) => {
        if (!window.confirm("Permanent delete? This will also remove the physical file.")) return;
        try {
            await axios.delete(`http://localhost:5000/api/documents/delete/${id}`);
            setSubmissions(submissions.filter(sub => sub.id !== id));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {
            alert("Delete failed");
        }
    };

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        Submissions <span className="text-blue-500 text-sm bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{stats.total}</span>
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium">Verify and manage OJT requirement compliance.</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#0f172a]/40 border border-slate-800 p-5 rounded-3xl text-left">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Waiting Review</p>
                    <p className="text-2xl font-black text-amber-500">{stats.pending}</p>
                </div>
                <div className="bg-[#0f172a]/40 border border-slate-800 p-5 rounded-3xl text-left">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Approved Files</p>
                    <p className="text-2xl font-black text-emerald-500">{stats.approved}</p>
                </div>
                <div className="bg-[#0f172a]/40 border border-slate-800 p-5 rounded-3xl text-left">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Success Rate</p>
                    <p className="text-2xl font-black text-blue-500">
                        {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                    </p>
                </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Synchronizing Database...</p>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="bg-[#0f172a]/60 border border-dashed border-slate-800 rounded-4xl p-20 text-center">
                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                            <FiFileText className="text-3xl text-slate-700" />
                        </div>
                        <p className="text-slate-400 font-bold">No student files detected in system.</p>
                    </div>
                ) : (
                    submissions.map((sub) => (
                        <div key={sub.id} className="group bg-[#0f172a]/40 hover:bg-[#0f172a]/80 border border-slate-800 hover:border-blue-500/30 p-5 rounded-4xl transition-all duration-300 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
                            
                            <div className="flex items-center gap-5 flex-1">
                                <div className="w-14 h-14 bg-linear-to-br from-blue-600/20 to-violet-600/10 rounded-2xl flex items-center justify-center text-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                                    <FiFileText className="text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{sub.student_name}</p>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">ID: #{sub.id}</p>
                                    </div>
                                    <h3 className="text-white font-bold text-lg leading-tight group-hover:text-blue-100 transition-colors">{sub.document_type}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-lg font-black uppercase border shadow-sm ${
                                            sub.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                            sub.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {sub.status === 'approved' ? <FiCheckCircle /> : sub.status === 'rejected' ? <FiX /> : <FiClock />}
                                            {sub.status}
                                        </span>
                                        <span className="text-[9px] text-slate-500 font-bold">
                                            {new Date(sub.submitted_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-800/50 pt-4 md:pt-0">
                                <button 
                                    onClick={() => window.open(`http://localhost:5000/${sub.file_path}`, '_blank')}
                                    className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                    title="View Original File"
                                >
                                    <FiExternalLink size={18} />
                                </button>

                                {sub.status === 'pending' && (
                                    <div className="flex gap-2 mr-2 border-r border-slate-800 pr-2">
                                        <button 
                                            onClick={() => updateStatus(sub.id, 'approved')}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                                        >
                                            <FiCheck size={18} />
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(sub.id, 'rejected')}
                                            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-3 rounded-xl transition-all border border-red-500/20"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                )}

                                <button 
                                    onClick={() => setEditingSub(sub)}
                                    className="p-3 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                                >
                                    <FiEdit3 size={18} />
                                </button>

                                <button 
                                    onClick={() => deleteSubmission(sub.id)}
                                    className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODERN EDIT MODAL */}
            {editingSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#020617] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-3xl animate-in zoom-in-95 duration-200 text-left">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-3xl mb-6 border border-blue-500/20">
                            <FiEdit3 className="text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Modify Record</h2>
                        <p className="text-slate-400 text-sm mb-8 font-medium">Updating document type for <span className="text-blue-400">{editingSub.student_name}</span></p>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Document Category</label>
                                <input 
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:border-blue-500/50 focus:ring-0 transition-all outline-none"
                                    defaultValue={editingSub.document_type}
                                    id="edit_doc_type"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => setEditingSub(null)}
                                    className="flex-1 text-[11px] font-black text-slate-400 hover:text-white py-4 rounded-2xl transition-all"
                                >
                                    CANCEL
                                </button>
                                <button 
                                    onClick={handleEdit}
                                    className="flex-1 text-[11px] font-black bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest"
                                >
                                    Update Entry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSubmission;