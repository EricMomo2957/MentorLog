import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { 
    CheckCircle2, Clock, AlertCircle, Download, 
    ChevronDown, Calendar, RefreshCw, FileText, Paperclip
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
        try {
            await api.put(`/tasks/${taskId}/status`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = tasks.filter(t => 
        filter === 'All' ? true : t.status === filter
    );

    const getStatusBadge = (status: Task['status']) => {
        switch (status) {
            case 'Completed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
            case 'In-Progress':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full"><Clock className="w-3 h-3" /> In-Progress</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full"><AlertCircle className="w-3 h-3" /> Pending</span>;
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
                    className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all"
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
                                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between ${
                                    currentStatus === s ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                                }`}
                            >
                                <span>{s}</span>
                                {currentStatus === s && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
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
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
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
                    {(['All', 'Pending', 'In-Progress', 'Completed'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                filter === f 
                                ? 'bg-blue-600 text-white font-semibold shadow-2xs' 
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
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
                    {filteredTasks.map((task) => (
                        <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    {getStatusBadge(task.status)}
                                    <span className="text-[10px] font-mono text-slate-400">ID: #{task.id}</span>
                                </div>
                                
                                <h3 className="text-base font-bold text-slate-900 leading-snug">{task.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">{task.task_description || 'No additional details provided.'}</p>

                                {/* Attached Photo or Document Resource Section */}
                                {task.attachment_url && (
                                    <div className="pt-3 border-t border-slate-100 space-y-2">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                                            <span>OJT Resource Attachment</span>
                                        </div>

                                        {isImageFile(task.attachment_name || task.attachment_url) ? (
                                            <div className="space-y-2">
                                                <a 
                                                    href={getFullPicUrl(task.attachment_url)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="block rounded-lg overflow-hidden border border-slate-200 group"
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
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all shadow-2xs"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[200px]">Download {task.attachment_name || 'Resource Photo'}</span>
                                                </a>
                                            </div>
                                        ) : (
                                            <a 
                                                href={getFullPicUrl(task.attachment_url)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                download
                                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all w-full justify-between group shadow-2xs"
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                                    <span className="truncate font-bold">{task.attachment_name || 'Attached Document Resource'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Download className="w-3.5 h-3.5 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                                                    <span className="text-[10px] text-blue-600 font-bold uppercase">Download</span>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                </div>

                                <StatusDropdown currentStatus={task.status} taskId={task.id} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-400 text-xs italic shadow-xs">
                    No OJT tasks found matching filter.
                </div>
            )}
        </div>
    );
};

export default MyTasks;