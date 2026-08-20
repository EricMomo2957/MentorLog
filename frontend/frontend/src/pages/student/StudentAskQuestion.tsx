import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    MessageSquare, Send, ArrowLeft, Download, Plus, 
    CheckCircle2, AlertCircle, Clock 
} from 'lucide-react';

interface Question {
    id: number;
    subject: string;
    message: string;
    status: 'pending' | 'replied' | 'closed';
    created_at: string;
}

interface Reply {
    id: number;
    sender_role: 'admin' | 'intern';
    reply_text: string;
    created_at: string;
}

const StudentAskQuestion = () => {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [myQuestions, setMyQuestions] = useState<Question[]>([]);
    const [selectedQ, setSelectedQ] = useState<Question | null>(null);
    const [thread, setThread] = useState<Reply[]>([]);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const studentId = localStorage.getItem('userId');

    const fetchMyQuestions = useCallback(async () => {
        if (!studentId) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/questions/student/${studentId}`);
            setMyQuestions(response.data);
        } catch (err) {
            console.error("Error fetching questions:", err);
        }
    }, [studentId]);

    useEffect(() => {
        if (studentId) {
            fetchMyQuestions();
        }
    }, [fetchMyQuestions, studentId]);

    const loadThread = useCallback(async (q: Question) => {
        try {
            setSelectedQ(q);
            const res = await axios.get(`http://localhost:5000/api/questions/thread/${q.id}`);
            setThread(res.data);
        } catch (err) {
            console.error("Thread load error:", err);
        }
    }, []);

    const handleNewInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim() || !studentId) {
            alert("Please fill in all fields before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/questions/ask', {
                student_id: studentId,
                subject,
                message
            });
            
            setSubject("");
            setMessage("");
            fetchMyQuestions();
            alert("Inquiry submitted successfully!");
        } catch (err) {
            console.error("Post error:", err);
            alert("Failed to submit inquiry.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedQ || !studentId) return;
        try {
            await axios.post('http://localhost:5000/api/questions/reply', {
                question_id: selectedQ.id,
                sender_id: studentId,
                sender_role: 'intern',
                reply_text: replyText
            });
            setReplyText("");
            loadThread(selectedQ);
        } catch (err) {
            console.error("Reply error:", err);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'replied') {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full"><CheckCircle2 className="w-3 h-3" /> Replied</span>;
        }
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ask a Question & Inquiry Desk</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Send direct inquiries and questions to your OJT coordinator or admin team</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => alert("Exporting inquiry thread...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Inquiries</span>
                    </button>
                </div>
            </div>

            {/* Split Screen Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: New Inquiry Form Card */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 h-fit sticky top-20">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-base font-bold text-slate-900">Submit New Inquiry</h2>
                        <p className="text-[11px] text-slate-500">Fill in subject and detailed message to contact your advisor</p>
                    </div>

                    <form onSubmit={handleNewInquiry} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Inquiry Subject</label>
                            <input 
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Attendance Hours Discrepancy"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Detailed Message</label>
                            <textarea 
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your concern or inquiry..."
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white resize-none"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
                        </button>
                    </form>
                </div>

                {/* Right: History & Chat Container */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl flex flex-col h-[72vh] shadow-xs overflow-hidden">
                    {!selectedQ ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
                            <h3 className="text-sm font-bold text-slate-900">Your Inquiry Threads</h3>
                            <p className="text-xs text-slate-500 max-w-xs mb-6">Select a thread below to view administrator responses</p>
                            
                            <div className="w-full max-w-md space-y-2 overflow-y-auto max-h-72 pr-1">
                                {myQuestions.length > 0 ? (
                                    myQuestions.map(q => (
                                        <button 
                                            key={q.id} 
                                            onClick={() => loadThread(q)}
                                            className="w-full text-left p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                {getStatusBadge(q.status)}
                                                <span className="text-[10px] font-mono text-slate-400">
                                                    {new Date(q.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{q.subject}</p>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs italic text-slate-400">No inquiry threads submitted yet.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Thread Header */}
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <button 
                                        onClick={() => setSelectedQ(null)} 
                                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mb-0.5"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Threads
                                    </button>
                                    <h2 className="text-base font-bold text-slate-900">{selectedQ.subject}</h2>
                                </div>
                                <div>
                                    {getStatusBadge(selectedQ.status)}
                                </div>
                            </div>

                            {/* Conversation Messages */}
                            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
                                {/* Student Initial Question */}
                                <div className="flex justify-end">
                                    <div className="max-w-[80%] bg-blue-600 text-white p-3.5 rounded-xl shadow-2xs space-y-1">
                                        <p className="text-[10px] font-bold uppercase text-blue-100">You (Initial Inquiry)</p>
                                        <p className="text-xs leading-relaxed font-medium">{selectedQ.message}</p>
                                    </div>
                                </div>

                                {/* Thread Replies */}
                                {thread.map(r => (
                                    <div key={r.id} className={`flex ${r.sender_role === 'intern' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3.5 rounded-xl border space-y-1 shadow-2xs ${
                                            r.sender_role === 'intern' 
                                            ? 'bg-blue-600 text-white border-blue-700' 
                                            : 'bg-white border-slate-200 text-slate-800'
                                        }`}>
                                            <p className={`text-[10px] font-bold uppercase ${r.sender_role === 'intern' ? 'text-blue-100' : 'text-blue-600'}`}>
                                                {r.sender_role === 'intern' ? 'You' : 'Administrator Coordinator'}
                                            </p>
                                            <p className="text-xs leading-relaxed font-medium">{r.reply_text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Input Box */}
                            <div className="p-3.5 bg-white border-t border-slate-100">
                                <div className="flex gap-2">
                                    <input 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                        placeholder="Type follow-up response..."
                                        className="flex-1 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                    <button 
                                        onClick={handleReply} 
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
                                    >
                                        <span>Send</span>
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAskQuestion;