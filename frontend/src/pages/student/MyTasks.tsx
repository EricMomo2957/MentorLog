import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { 
    CheckCircle2, Clock, AlertCircle, Download, 
    ChevronDown, Calendar, RefreshCw, FileText, Paperclip,
    ExternalLink, ShieldCheck, Plus, X, Loader2
} from 'lucide-react';

interface Task {
    id: number;
    user_id: number;
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    due_date: string;
    attachment_url?: string;
    attachment_name?: string;
    proof_link?: string;
    proof_file_url?: string;
    submission_notes?: string;
    verified_by_mentor?: boolean;
}

type FilterType = 'All' | 'Pending' | 'In-Progress' | 'Completed';

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

const isImageFile = (filename?: string) => {
    if (!filename) return false;
    const ext = filename.toLowerCase();
    return ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.webp') || ext.endsWith('.gif');
};

const MyTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('All');

    // Deliverable Modal States
    const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
    const [activeTaskForProof, setActiveTaskForProof] = useState<Task | null>(null);
    const [proofLink, setProofLink] = useState('');
    const [submissionNotes, setSubmissionNotes] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isSubmittingProof, setIsSubmittingProof] = useState(false);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/tasks/my-tasks');
            const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setTasks(data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = async (taskId: number, newStatus: Task['status']) => {
        if (newStatus === 'Completed') {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                openDeliverableModal(task);
                return;
            }
        }

        try {
            await api.put(`/tasks/${taskId}/status`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const openDeliverableModal = (task: Task) => {
        setActiveTaskForProof(task);
        setProofLink(task.proof_link || '');
        setSubmissionNotes(task.submission_notes || '');
        setProofFile(null);
        setIsDeliverableModalOpen(true);
    };

    const handleSubmitDeliverable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTaskForProof) return;

        try {
            setIsSubmittingProof(true);
            const formData = new FormData();
            formData.append('status', 'Completed');
            if (proofLink.trim()) formData.append('proof_link', proofLink.trim());
            if (submissionNotes.trim()) formData.append('submission_notes', submissionNotes.trim());
            if (proofFile) formData.append('proof_file', proofFile);

            await api.put(`/tasks/${activeTaskForProof.id}/status`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsDeliverableModalOpen(false);
            fetchTasks();
        } catch (error) {
            console.error("Failed to submit deliverable proof:", error);
        } finally {
            setIsSubmittingProof(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = tasks.filter(t => 
        filter === 'All' ? true : t.status === filter
    );

    const getTaskCardStyles = (status: Task['status']) => {
        switch (status) {
            case 'Completed':
                return {
                    cardBg: 'bg-[#e6f4ea] border-[#86efac] hover:border-emerald-400 shadow-xs hover:shadow-md',
                    dividerBg: 'border-emerald-200/90',
                    idText: 'text-emerald-800 font-bold',
                    iconColor: 'text-emerald-700',
                    attachmentLabel: 'text-emerald-800 font-extrabold',
                    downloadBtnBg: 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                };
            case 'In-Progress':
                return {
                    cardBg: 'bg-[#e0f2fe] border-[#7dd3fc] hover:border-sky-400 shadow-xs hover:shadow-md',
                    dividerBg: 'border-sky-200/90',
                    idText: 'text-sky-800 font-bold',
                    iconColor: 'text-sky-700',
                    attachmentLabel: 'text-sky-800 font-extrabold',
                    downloadBtnBg: 'bg-white text-sky-800 border-sky-300 hover:bg-sky-50'
                };
            default: // Pending
                return {
                    cardBg: 'bg-[#fef9c3] border-[#fde047] hover:border-amber-400 shadow-xs hover:shadow-md',
                    dividerBg: 'border-amber-200/90',
                    idText: 'text-amber-800 font-bold',
                    iconColor: 'text-amber-700',
                    attachmentLabel: 'text-amber-800 font-extrabold',
                    downloadBtnBg: 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                };
        }
    };

    const getStatusBadge = (status: Task['status']) => {
        switch (status) {
            case 'Completed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 rounded-full shadow-2xs"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed</span>;
            case 'In-Progress':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-sky-800 bg-white border border-sky-300 rounded-full shadow-2xs"><Clock className="w-3 h-3 text-sky-600" /> In-Progress</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-white border border-amber-300 rounded-full shadow-2xs"><AlertCircle className="w-3 h-3 text-amber-600" /> Pending</span>;
        }
    };

    // --- STATUS DROPDOWN COMPONENT ---
    const StatusDropdown = ({ currentStatus, taskId }: { currentStatus: Task['status'], taskId: number }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const statuses: Task['status'][] = ['Pending', 'In-Progress', 'Completed'];

        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                    <span>{currentStatus}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden text-xs">
                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Change Status</p>
                        </div>
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    updateStatus(taskId, s);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${
                                    currentStatus === s ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                                }`}
                            >
                                <span>{s}</span>
                                {currentStatus === s && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Assigned OJT Tasks</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Track, complete, view attachments, and update the status of your assigned internship directives</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchTasks}
                        disabled={loading}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                        <span>Refresh Tasks</span>
                    </button>
                </div>
            </div>

            {/* Filter & Control Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                
                {/* Left Filter Pill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {(['All', 'Pending', 'In-Progress', 'Completed'] as FilterType[]).map((f) => {
                        let activeStyle = 'bg-slate-900 text-white font-bold shadow-2xs';
                        if (f === 'Pending') activeStyle = 'bg-amber-500 text-white font-bold shadow-2xs';
                        if (f === 'In-Progress') activeStyle = 'bg-blue-600 text-white font-bold shadow-2xs';
                        if (f === 'Completed') activeStyle = 'bg-emerald-600 text-white font-bold shadow-2xs';

                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                    filter === f 
                                    ? activeStyle 
                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {f}
                            </button>
                        );
                    })}
                </div>

                <span className="text-xs font-semibold text-slate-500 font-mono">
                    Showing {filteredTasks.length} tasks
                </span>
            </div>

            {/* Main Content Grid */}
            {loading ? (
                <div className="py-20 text-center text-slate-400 text-xs font-medium animate-pulse">
                    Retrieving assigned tasks...
                </div>
            ) : filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTasks.map((task) => {
                        const style = getTaskCardStyles(task.status);

                        return (
                            <div 
                                key={task.id} 
                                className={`${style.cardBg} rounded-xl p-5 border transition-all flex flex-col justify-between space-y-4`}
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        {getStatusBadge(task.status)}
                                        <span className={`text-[10px] font-mono ${style.idText}`}>ID: #{task.id}</span>
                                    </div>
                                    
                                    <h3 className="text-base font-bold text-slate-900 leading-snug">{task.title}</h3>
                                    <p className="text-xs text-slate-700 leading-relaxed">{task.task_description || 'No additional details provided.'}</p>

                                    {/* Attached Photo or Document Resource Section */}
                                    {task.attachment_url && (
                                        <div className={`pt-3 border-t ${style.dividerBg} space-y-2`}>
                                            <div className={`flex items-center gap-1.5 text-[11px] ${style.attachmentLabel} uppercase tracking-wider`}>
                                                <Paperclip className={`w-3.5 h-3.5 ${style.iconColor}`} />
                                                <span>Mentor Resource Attachment</span>
                                            </div>

                                            {isImageFile(task.attachment_name || task.attachment_url) ? (
                                                <div className="space-y-2">
                                                    <a 
                                                        href={getFullPicUrl(task.attachment_url)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="block rounded-lg overflow-hidden border border-slate-200/80 group bg-white"
                                                    >
                                                        <img 
                                                            src={getFullPicUrl(task.attachment_url)} 
                                                            alt={task.attachment_name || 'Task Resource Photo'} 
                                                            className="w-full max-h-48 object-cover group-hover:scale-102 transition-transform duration-300"
                                                        />
                                                    </a>
                                                    <a 
                                                        href={getFullPicUrl(task.attachment_url)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        download
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${style.downloadBtnBg} border transition-all shadow-2xs`}
                                                    >
                                                        <Download className={`w-3.5 h-3.5 ${style.iconColor}`} />
                                                        <span className="truncate max-w-[200px]">Download {task.attachment_name || 'Resource Photo'}</span>
                                                    </a>
                                                </div>
                                            ) : (
                                                <a 
                                                    href={getFullPicUrl(task.attachment_url)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    download
                                                    className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold ${style.downloadBtnBg} border transition-all w-full justify-between group shadow-2xs`}
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <FileText className={`w-4 h-4 ${style.iconColor} shrink-0`} />
                                                        <span className="truncate font-bold">{task.attachment_name || 'Attached Document Resource'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Download className={`w-3.5 h-3.5 ${style.iconColor} group-hover:translate-y-0.5 transition-transform`} />
                                                        <span className={`text-[10px] ${style.iconColor} font-bold uppercase`}>Download</span>
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Submitted Task Deliverable & Proof Section */}
                                    {(task.proof_link || task.submission_notes || task.status === 'Completed') && (
                                        <div className={`pt-3 border-t ${style.dividerBg} space-y-2`}>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 text-slate-800`}>
                                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                                    My Work Deliverable
                                                </span>
                                                {task.verified_by_mentor ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified by Mentor
                                                    </span>
                                                ) : task.status === 'Completed' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                        <Clock className="w-3 h-3 text-amber-600" /> Pending Mentor Review
                                                    </span>
                                                ) : null}
                                            </div>

                                            {task.proof_link && (
                                                <a
                                                    href={task.proof_link.startsWith('http') ? task.proof_link : `https://${task.proof_link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-all shadow-2xs w-full justify-between"
                                                >
                                                    <span className="truncate max-w-[85%]">{task.proof_link}</span>
                                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                                </a>
                                            )}

                                            {task.submission_notes && (
                                                <p className="text-[11px] text-slate-600 italic bg-white/60 p-2 rounded-lg border border-slate-200/60">
                                                    "{task.submission_notes}"
                                                </p>
                                            )}

                                            <button
                                                onClick={() => openDeliverableModal(task)}
                                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer pt-0.5"
                                            >
                                                <Plus className="w-3 h-3" />
                                                <span>{task.proof_link || task.submission_notes ? 'Update Deliverable Proof' : 'Attach Output Link / Notes'}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={`flex items-center justify-between pt-3 border-t ${style.dividerBg}`}>
                                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                                        <Calendar className={`w-3.5 h-3.5 ${style.iconColor}`} />
                                        <span className={style.idText}>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                    </div>

                                    <StatusDropdown currentStatus={task.status} taskId={task.id} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-400 text-xs italic shadow-xs">
                    No OJT tasks found matching filter.
                </div>
            )}

            {/* Deliverable Proof Submission Modal */}
            {isDeliverableModalOpen && activeTaskForProof && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Submit Task Deliverable & Proof</h3>
                                    <p className="text-[11px] text-slate-500">Attach deliverables for: "{activeTaskForProof.title}"</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDeliverableModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitDeliverable} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Deliverable URL (GitHub / Google Drive / Figma / Loom)
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        placeholder="https://github.com/my-org/project or https://drive.google.com/..."
                                        value={proofLink}
                                        onChange={(e) => setProofLink(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-indigo-500 outline-none"
                                    />
                                    <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Attach Output File (Screenshot, Document, or ZIP)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Submission Summary & Notes
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Briefly describe what you built, accomplished, or resolved for this task..."
                                    value={submissionNotes}
                                    onChange={(e) => setSubmissionNotes(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsDeliverableModalOpen(false)}
                                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingProof}
                                    className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    {isSubmittingProof ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Submitting Output...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Mark as Completed with Proof</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTasks;