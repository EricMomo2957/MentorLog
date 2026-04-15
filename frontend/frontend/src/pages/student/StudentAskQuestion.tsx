import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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

    // Get the dynamic ID from localStorage
    const studentId = localStorage.getItem('userId');

    // 1. Memoized fetcher using dynamic studentId
    const fetchMyQuestions = useCallback(async () => {
        if (!studentId) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/questions/student/${studentId}`);
            // Note: Changed to setMyQuestions to match your state variable
            setMyQuestions(response.data);
        } catch (err) {
            console.error("Error fetching your specific questions:", err);
        }
    }, [studentId]);

    // 2. Initial load effect
    useEffect(() => {
        const loadData = async () => {
            if (studentId) {
                await fetchMyQuestions();
            }
        };
        loadData();
    }, [fetchMyQuestions, studentId]);

    // 3. Thread loader
    const loadThread = useCallback(async (q: Question) => {
        try {
            setSelectedQ(q);
            const res = await axios.get(`http://localhost:5000/api/questions/thread/${q.id}`);
            setThread(res.data);
        } catch (err) {
            console.error("Thread load error:", err);
        }
    }, []);

    // 4. Submission Handler
    const handleNewInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim() || !studentId) {
            alert("Please fill in all fields before submitting.");
            return;
        }

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
        }
    };

    // 5. Reply Handler
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

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-slate-300 p-8 font-sans">
            <div className="max-w-350 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- LEFT: NEW FORM --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="mb-8">
                        <p className="text-[10px] font-black text-[#00df9a] uppercase tracking-[0.4em] mb-2">Service Desk</p>
                        <h1 className="text-4xl font-light text-white uppercase tracking-tighter">New <span className="font-black text-blue-500">Inquiry</span></h1>
                    </div>

                    <form onSubmit={handleNewInquiry} className="bg-[#0d1424] border border-slate-800 p-6 space-y-4 shadow-xl">
                        <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Topic Subject</label>
                            <input 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-[#0a0f1c] border border-slate-800 p-3 text-xs mt-1 text-white focus:border-[#00df9a] outline-none transition-all"
                                placeholder="E.G. ATTENDANCE DISCREPANCY"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Message</label>
                            <textarea 
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-[#0a0f1c] border border-slate-800 p-3 text-xs mt-1 text-white focus:border-[#00df9a] outline-none resize-none"
                                placeholder="DESCRIBE YOUR CONCERN..."
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full py-3 bg-[#00df9a] text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all cursor-pointer"
                        >
                            Submit Inquiry
                        </button>
                    </form>
                </div>

                {/* --- RIGHT: HISTORY & CHAT --- */}
                <div className="lg:col-span-8 bg-[#0d1424] border border-slate-800 flex flex-col h-[75vh] shadow-2xl relative">
                    {!selectedQ ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-4">Select a Thread to view Replies</h2>
                            <div className="grid grid-cols-1 gap-3 w-full max-w-md overflow-y-auto pr-2 custom-scrollbar">
                                {myQuestions.map(q => (
                                    <button 
                                        key={q.id} 
                                        onClick={() => loadThread(q)}
                                        className="p-4 bg-[#0a0f1c] border border-slate-800 text-left hover:border-[#00df9a] transition-all group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase">{q.status}</span>
                                            <span className="text-[9px] text-slate-600 uppercase font-mono">{new Date(q.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-bold text-white uppercase truncate">{q.subject}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-5 border-b border-slate-800 bg-[#111a2e] flex justify-between items-center">
                                <div>
                                    <button onClick={() => setSelectedQ(null)} className="text-[9px] font-black text-slate-500 hover:text-white uppercase mb-1">← Back to list</button>
                                    <h2 className="text-lg font-bold text-white uppercase">{selectedQ.subject}</h2>
                                </div>
                                <span className="text-[9px] font-black px-3 py-1 bg-[#00df9a]/10 text-[#00df9a] border border-[#00df9a]/20 uppercase">
                                    {selectedQ.status}
                                </span>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#0a0f1c]/50 custom-scrollbar">
                                <div className="flex justify-end">
                                    <div className="max-w-[80%] bg-[#1a253d] p-4 border-r-4 border-blue-600 shadow-lg">
                                        <p className="text-[8px] font-black text-blue-400 uppercase mb-1">You (Initial Inquiry)</p>
                                        <p className="text-sm">{selectedQ.message}</p>
                                    </div>
                                </div>

                                {thread.map(r => (
                                    <div key={r.id} className={`flex ${r.sender_role === 'intern' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 border ${
                                            r.sender_role === 'intern' 
                                            ? 'bg-[#1a253d] border-blue-900/40 border-r-4 border-r-blue-500' 
                                            : 'bg-slate-800 border-slate-700 border-l-4 border-l-[#00df9a]'
                                        }`}>
                                            <p className={`text-[8px] font-black uppercase mb-1 ${r.sender_role === 'intern' ? 'text-blue-500' : 'text-[#00df9a]'}`}>
                                                {r.sender_role === 'intern' ? 'You' : 'Administrator'}
                                            </p>
                                            <p className="text-sm leading-relaxed">{r.reply_text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-[#111a2e] border-t border-slate-800">
                                <div className="flex gap-2">
                                    <input 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                        placeholder="TYPE YOUR RESPONSE..."
                                        className="flex-1 bg-[#0a0f1c] border border-slate-800 p-3 text-xs text-white outline-none focus:border-[#00df9a]"
                                    />
                                    <button onClick={handleReply} className="bg-blue-600 px-6 font-black text-[10px] uppercase text-white hover:bg-[#00df9a] hover:text-black transition-all">
                                        Send
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