import { useState, useEffect } from 'react';
import axios from 'axios';

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

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/documents/all');
            setSubmissions(res.data);
        } catch (err) {
            console.error("Error fetching submissions", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await axios.put(`http://localhost:5000/api/documents/update/${id}`, { status, feedback: "" });
            fetchSubmissions(); // Refresh list without reloading whole page
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleViewFile = (path: string) => {
        // This opens the file in a new tab using your backend static path
        window.open(`http://localhost:5000/${path}`, '_blank');
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">Manage Submissions</h1>
                <p className="text-slate-400 text-sm font-medium">Review and approve student requirement documents.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest animate-pulse">Loading Documents...</div>
                ) : submissions.length === 0 ? (
                    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-20 text-center">
                        <span className="text-4xl mb-4 block">📂</span>
                        <p className="text-slate-400 font-bold">No submissions found.</p>
                    </div>
                ) : (
                    submissions.map((sub) => (
                        <div key={sub.id} className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800/60 p-6 rounded-4xl flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-blue-500/40 transition-all shadow-lg">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-xl border border-blue-500/20">
                                    📄
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{sub.student_name}</p>
                                    <h3 className="text-white font-bold text-lg leading-tight">{sub.document_type}</h3>
                                    <div className="flex gap-3 mt-2">
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase border ${
                                            sub.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                            sub.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {sub.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6 md:mt-0 w-full md:w-auto">
                                <button 
                                    onClick={() => handleViewFile(sub.file_path)}
                                    className="flex-1 md:flex-none text-[10px] font-black bg-slate-800 text-slate-200 px-6 py-3 rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
                                >
                                    VIEW FILE
                                </button>
                                {sub.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => updateStatus(sub.id, 'approved')}
                                            className="flex-1 md:flex-none text-[10px] font-black bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            APPROVE
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(sub.id, 'rejected')}
                                            className="flex-1 md:flex-none text-[10px] font-black bg-red-600/10 text-red-500 px-6 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-500/20"
                                        >
                                            REJECT
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageSubmission;