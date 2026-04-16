import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosError } from 'axios';

interface Question {
    id: number;
    student_id: number;
    student_name: string;
    subject: string;
    message: string;
    status: 'pending' | 'replied' | 'closed';
    created_at: string;
}

interface Reply {
    id: number;
    question_id: number;
    sender_role: 'admin' | 'intern';
    reply_text: string;
    created_at: string;
}

const ManageAskQuestion = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [thread, setThread] = useState<Reply[]>([]);
    const [replyText, setReplyText] = useState("");
    
    // NEW STATES FOR EDITING
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
    
    const isInitialMount = useRef(true);

    const fetchQuestions = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/questions/all');
            setQuestions(res.data);
        } catch (err) {
            const error = err as AxiosError;
            console.error("Error fetching questions:", error);
        }
    }, []);

    const loadThread = useCallback(async (q: Question) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/questions/thread/${q.id}`);
            setThread(res.data);
            setSelectedQuestion(q);
            setEditingReplyId(null); // Reset edit mode when switching questions
            setReplyText("");
        } catch (err) {
            const error = err as AxiosError;
            console.error("Error loading thread:", error);
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            if (isInitialMount.current) {
                await fetchQuestions();
                isInitialMount.current = false;
            }
        };
        void loadInitialData();
    }, [fetchQuestions]);

    // PREPARE EDIT MODE
    const startEdit = (reply: Reply) => {
        setEditingReplyId(reply.id);
        setReplyText(reply.reply_text);
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedQuestion) return;
        
        const adminId = localStorage.getItem('userId') || '1';

        try {
            if (editingReplyId) {
                // UPDATE LOGIC
                await axios.put(`http://localhost:5000/api/questions/reply/${editingReplyId}`, {
                    reply_text: replyText
                });
                alert("Response Updated!");
            } else {
                // CREATE LOGIC
                await axios.post('http://localhost:5000/api/questions/reply', {
                    question_id: selectedQuestion.id,
                    sender_id: parseInt(adminId),
                    sender_role: 'admin',
                    reply_text: replyText
                });
                alert("Response Transmitted Successfully!");
            }
            
            setReplyText(""); 
            setEditingReplyId(null);
            await loadThread(selectedQuestion); 
            await fetchQuestions(); 
        } catch (err) {
            console.error("Error processing reply:", err);
            alert("Action failed.");
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        if (!window.confirm("Are you sure you want to permanently delete this inquiry?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/questions/delete/${id}`);
            if (selectedQuestion?.id === id) {
                setSelectedQuestion(null);
                setThread([]);
            }
            await fetchQuestions(); 
            alert("Inquiry purged successfully.");
        } catch (err) {
            console.error("Purge Error:", err);
            alert("Failed to delete the record.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-slate-300 p-8 flex gap-6 font-sans">
            {/* Sidebar View */}
            <div className="w-1/3 bg-[#0d1424] border border-slate-800 rounded-sm overflow-hidden flex flex-col h-[85vh] shadow-2xl">
                <div className="p-5 border-b border-slate-800 bg-[#111a2e] flex justify-between items-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Question Inbox</h2>
                    <span className="bg-blue-600/20 text-blue-500 text-[9px] px-2 py-0.5 rounded-full font-bold">
                        {questions.length} ACTIVE
                    </span>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {questions.map((q) => (
                        <button 
                            key={q.id} 
                            onClick={() => loadThread(q)}
                            className={`w-full text-left p-5 border-b border-slate-800 transition-all border-l-2 relative group ${
                                selectedQuestion?.id === q.id 
                                ? 'bg-[#1a253d] border-l-[#00df9a]' 
                                : 'hover:bg-[#141d33] border-l-transparent'
                            }`}
                        >
                            <div 
                                onClick={(e) => handleDelete(e, q.id)}
                                className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                                title="Delete Inquiry"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </div>

                            <p className="text-[10px] font-bold text-[#00df9a] uppercase tracking-wider mb-1">{q.student_name}</p>
                            <p className="text-sm text-white font-medium truncate pr-6">{q.subject}</p>
                            <div className="flex justify-between items-center mt-3">
                                <span className={`text-[8px] px-2 py-0.5 rounded-sm font-black uppercase ${
                                    q.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                    {q.status}
                                </span>
                                <p className="text-[9px] text-slate-600 font-mono">
                                    {new Date(q.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Conversation View */}
            <div className="flex-1 bg-[#0d1424] border border-slate-800 rounded-sm flex flex-col h-[85vh] shadow-2xl overflow-hidden">
                {selectedQuestion ? (
                    <>
                        <div className="p-6 border-b border-slate-800 bg-[#111a2e]">
                            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.3em] mb-1">Subject Header</p>
                            <h2 className="text-2xl font-light text-white uppercase tracking-tight">{selectedQuestion.subject}</h2>
                        </div>
                        
                        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#0a0f1c]/30 custom-scrollbar">
                            {/* Original Question */}
                            <div className="bg-[#1a253d] p-5 rounded-sm border-l-2 border-[#00df9a] relative shadow-lg">
                                <div className="absolute -top-2.5 left-4 bg-[#00df9a] text-black text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter">
                                    Student Inquiry
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed italic">"{selectedQuestion.message}"</p>
                            </div>

                            {/* Thread Replies */}
                            {thread.map((r) => (
                                <div key={r.id} className={`flex ${r.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-sm border relative group/reply ${
                                        r.sender_role === 'admin' 
                                        ? 'bg-[#111a2e] border-blue-900/50 border-r-4 border-r-blue-600' 
                                        : 'bg-slate-800/40 border-slate-700 border-l-4 border-l-slate-500'
                                    }`}>
                                        <div className="flex items-center justify-between gap-6 mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{r.sender_role}</span>
                                                <span className="text-[8px] font-mono text-slate-600">
                                                    {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            
                                            {/* EDIT BUTTON FOR ADMIN REPLIES */}
                                            {r.sender_role === 'admin' && (
                                                <button 
                                                    onClick={() => startEdit(r)}
                                                    className="opacity-0 group-hover/reply:opacity-100 transition-opacity text-[9px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-tighter"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-200 leading-snug">{r.reply_text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-slate-800 bg-[#111a2e]">
                            {editingReplyId && (
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">
                                        Editing Mode Active
                                    </span>
                                    <button 
                                        onClick={() => { setEditingReplyId(null); setReplyText(""); }}
                                        className="text-[8px] text-slate-500 hover:text-white uppercase font-bold"
                                    >
                                        Cancel Edit
                                    </button>
                                </div>
                            )}
                            <div className={`flex gap-3 bg-[#0a0f1c] border p-2 focus-within:border-blue-500 transition-all shadow-inner ${editingReplyId ? 'border-amber-500/50' : 'border-slate-800'}`}>
                                <input 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                                    placeholder={editingReplyId ? "MODIFY YOUR RESPONSE..." : "TYPE YOUR OFFICIAL RESPONSE..."}
                                    className="flex-1 bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-slate-700 uppercase tracking-wider"
                                />
                                <button 
                                    onClick={handleReply} 
                                    className={`${editingReplyId ? 'bg-amber-600' : 'bg-blue-600'} hover:bg-[#00df9a] text-white hover:text-black font-black text-[10px] px-8 uppercase transition-all flex items-center gap-2`}
                                >
                                    {editingReplyId ? 'Update' : 'Transmit'} <span>→</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-700 bg-[#0a0f1c]/20">
                        <div className="w-16 h-16 border-2 border-slate-900 rounded-full flex items-center justify-center mb-6 opacity-40">
                            <span className="text-2xl animate-pulse">✉</span>
                        </div>
                        <h3 className="uppercase tracking-[0.4em] text-[11px] font-black mb-2">System Ready</h3>
                        <p className="text-[10px] uppercase tracking-widest text-slate-800">Select a communication thread to initiate response</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageAskQuestion;