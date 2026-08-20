import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { 
    MessageSquare, Send, Trash2, Edit3, Search, Filter, Download
} from 'lucide-react';

interface Question {
    id: number;
    student_id: number;
    student_name: string;
    subject: string;
    message: string;
    status: 'pending' | 'replied' | 'closed';
    created_at: string;
    profile_pic?: string;
}

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

interface Reply {
    id: number;
    question_id: number;
    sender_role: 'admin' | 'intern';
    reply_text: string;
    created_at: string;
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
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const ManageAskQuestion = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [thread, setThread] = useState<Reply[]>([]);
    const [replyText, setReplyText] = useState("");
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    
    const isInitialMount = useRef(true);

    const fetchQuestions = useCallback(async () => {
        try {
            const res = await api.get('/questions/all');
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setQuestions(data);
        } catch (err) {
            console.error("Error fetching questions:", err);
        }
    }, []);

    const loadThread = useCallback(async (q: Question) => {
        try {
            const res = await api.get(`/questions/thread/${q.id}`);
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setThread(data);
            setSelectedQuestion(q);
            setEditingReplyId(null); 
            setReplyText("");
        } catch (err) {
            console.error("Error loading thread:", err);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            if (isInitialMount.current) {
                await fetchQuestions();
                if (isMounted) isInitialMount.current = false;
            }
        };
        void loadInitialData();
        return () => { isMounted = false; };
    }, [fetchQuestions]);

    const startEdit = (reply: Reply) => {
        setEditingReplyId(reply.id);
        setReplyText(reply.reply_text);
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedQuestion) return;
        
        const adminId = localStorage.getItem('userId') || '1';

        try {
            if (editingReplyId) {
                await api.put(`/questions/reply/${editingReplyId}`, {
                    reply_text: replyText
                });
            } else {
                await api.post('/questions/reply', {
                    question_id: selectedQuestion.id,
                    sender_id: parseInt(adminId),
                    sender_role: 'admin',
                    reply_text: replyText
                });
            }
            
            setReplyText(""); 
            setEditingReplyId(null);
            await loadThread(selectedQuestion); 
            await fetchQuestions(); 
        } catch (err) {
            console.error("Error processing reply:", err);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        if (!window.confirm("Are you sure you want to permanently delete this inquiry?")) return;

        try {
            await api.delete(`/questions/delete/${id}`);
            if (selectedQuestion?.id === id) {
                setSelectedQuestion(null);
                setThread([]);
            }
            await fetchQuestions(); 
        } catch (err) {
            console.error("Purge Error:", err);
        }
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || q.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Question & Answer Desk</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Direct messaging channel for answering student questions and technical inquiries</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => alert("Exporting Q&A thread logs...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Inbox</span>
                    </button>
                </div>
            </div>

            {/* Split Screen Container */}
            <div className="flex flex-col lg:flex-row gap-6 h-[72vh]">
                
                {/* Left Sidebar View */}
                <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-xs shrink-0">
                    
                    {/* Header Controls */}
                    <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 space-y-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Active Inquiries</h2>
                            <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                {filteredQuestions.length} Threads
                            </span>
                        </div>
                        
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text"
                                placeholder="Search inquiry..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-[11px] text-slate-800 outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Inquiry List */}
                    <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                        {filteredQuestions.length > 0 ? (
                            filteredQuestions.map((q) => {
                                const avatarStyle = getAvatarStyle(q.student_id || q.id);
                                const initials = getInitials(q.student_name);
                                const isSelected = selectedQuestion?.id === q.id;

                                return (
                                    <button 
                                        key={q.id} 
                                        onClick={() => loadThread(q)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all relative group ${
                                            isSelected 
                                            ? 'bg-blue-50/80 border-blue-200 shadow-2xs' 
                                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                    >
                                        <div 
                                            onClick={(e) => handleDelete(e, q.id)}
                                            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            title="Delete Inquiry"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </div>

                                        <div className="flex items-center gap-2.5 mb-1">
                                            {q.profile_pic ? (
                                                <img 
                                                    src={getFullPicUrl(q.profile_pic)} 
                                                    alt={q.student_name} 
                                                    className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                />
                                            ) : (
                                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 ${avatarStyle}`}>
                                                    {initials}
                                                </div>
                                            )}
                                            <span className="text-xs font-bold text-slate-900 truncate">{q.student_name}</span>
                                        </div>

                                        <p className="text-xs font-semibold text-slate-800 truncate pr-5 mb-1.5">{q.subject}</p>
                                        
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className={`px-2 py-0.5 rounded-full font-semibold border ${
                                                q.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                {q.status}
                                            </span>
                                            <span className="text-slate-400 font-mono">
                                                {new Date(q.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-xs italic">No inquiry threads found.</div>
                        )}
                    </div>
                </div>

                {/* Main Conversation View */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col shadow-xs overflow-hidden">
                    {selectedQuestion ? (
                        <>
                            {/* Thread Header */}
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Inquiry Thread</span>
                                    <h2 className="text-base font-bold text-slate-900">{selectedQuestion.subject}</h2>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">ID: #{selectedQuestion.id}</span>
                            </div>
                            
                            {/* Messages Container */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                                {/* Student Initial Question Card */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarStyle(selectedQuestion.student_id || selectedQuestion.id)}`}>
                                                {getInitials(selectedQuestion.student_name)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-900">{selectedQuestion.student_name}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">{new Date(selectedQuestion.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                                        "{selectedQuestion.message}"
                                    </p>
                                </div>

                                {/* Replies */}
                                {thread.map((r) => (
                                    <div key={r.id} className={`flex ${r.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3.5 rounded-xl border space-y-1.5 shadow-2xs ${
                                            r.sender_role === 'admin' 
                                            ? 'bg-blue-600 text-white border-blue-700' 
                                            : 'bg-white border-slate-200 text-slate-800'
                                        }`}>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase ${r.sender_role === 'admin' ? 'text-blue-100' : 'text-blue-600'}`}>{r.sender_role}</span>
                                                    <span className={`text-[10px] font-mono ${r.sender_role === 'admin' ? 'text-blue-200' : 'text-slate-400'}`}>
                                                        {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                
                                                {r.sender_role === 'admin' && (
                                                    <button 
                                                        onClick={() => startEdit(r)}
                                                        className="text-[10px] font-semibold text-white/80 hover:text-white flex items-center gap-1 bg-blue-700/60 px-2 py-0.5 rounded transition-colors"
                                                    >
                                                        <Edit3 className="w-3 h-3" /> Edit
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs leading-relaxed font-medium">{r.reply_text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Input Box */}
                            <div className="p-3.5 border-t border-slate-200 bg-white space-y-2">
                                {editingReplyId && (
                                    <div className="flex justify-between items-center text-xs px-2">
                                        <span className="text-amber-600 font-semibold">Editing selected response...</span>
                                        <button 
                                            onClick={() => { setEditingReplyId(null); setReplyText(""); }}
                                            className="text-slate-400 hover:text-slate-700 font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <input 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                        placeholder={editingReplyId ? "Modify your response..." : "Type response to student..."}
                                        className="flex-1 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                    <button 
                                        onClick={handleReply} 
                                        className={`${editingReplyId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5`}
                                    >
                                        <span>{editingReplyId ? 'Update' : 'Send'}</span>
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-2">
                            <MessageSquare className="w-10 h-10 text-slate-300 animate-pulse" />
                            <h3 className="text-sm font-bold text-slate-800">Select an Inquiry Thread</h3>
                            <p className="text-xs text-slate-500 max-w-xs">Choose a student inquiry from the sidebar list to view conversation and reply.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageAskQuestion;