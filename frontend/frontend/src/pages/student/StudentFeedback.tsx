import { useState } from 'react';

const StudentFeedback = () => {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'General',
        rating: 5,
        comment: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMsg(null);

        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            const response = await fetch('http://localhost:5000/api/feedback/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: userData.id,
                    ...formData
                })
            });

            const data = await response.json();

            if (data.success) {
                setStatusMsg({ type: 'success', text: 'FEEDBACK_TRANSMITTED_SUCCESSFULLY' });
                setFormData({ subject: '', category: 'General', rating: 5, comment: '' });
            } else {
                throw new Error(data.message);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'TRANSMISSION_FAILURE_RETRY_LATER' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="font-mono text-slate-300 p-6 max-w-2xl mx-auto">
            <div className="mb-10 border-b border-slate-800 pb-4">
                <div className="text-blue-500 text-[10px] font-black tracking-[0.4em] uppercase">COMM_UPLINK_v1.0</div>
                <h1 className="text-3xl font-black text-white italic uppercase">Submit <span className="not-italic text-slate-600">Feedback</span></h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/10 border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative scanning line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20 animate-pulse" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Category_Type</label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-blue-500 outline-none appearance-none"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="General">General</option>
                            <option value="Technical">Technical</option>
                            <option value="Mentor">Mentor</option>
                            <option value="Facility">Facility</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Experience_Rating</label>
                        <div className="flex gap-2 bg-slate-950 border border-slate-800 p-2 justify-around">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setFormData({...formData, rating: num})}
                                    className={`w-8 h-8 text-xs font-black transition-all ${formData.rating >= num ? 'bg-blue-500 text-black' : 'text-slate-600 hover:text-slate-400'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Subject_Header</label>
                    <input 
                        required
                        className="w-full bg-transparent border-b border-slate-800 p-2 text-sm text-white focus:border-blue-500 outline-none uppercase"
                        placeholder="BRIEF_DESCRIPTION_OF_FEEDBACK"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Detailed_Message</label>
                    <textarea 
                        required
                        className="w-full bg-slate-950 border border-slate-800 p-4 text-sm text-white h-32 focus:border-blue-500 outline-none resize-none"
                        placeholder="INPUT_FEEDBACK_DATA_STREAM..."
                        value={formData.comment}
                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                    />
                </div>

                {statusMsg && (
                    <div className={`p-4 text-[10px] font-black uppercase border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                        {statusMsg.text}
                    </div>
                )}

                <button 
                    disabled={isSubmitting}
                    className="w-full bg-white text-black py-4 font-black uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all disabled:opacity-20"
                >
                    {isSubmitting ? 'PROCESSING_UPLOAD...' : 'SEND_TO_ADMINISTRATOR'}
                </button>
            </form>
        </div>
    );
};

export default StudentFeedback;