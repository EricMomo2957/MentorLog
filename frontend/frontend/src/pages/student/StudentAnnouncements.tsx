import { useState, useEffect } from 'react';

interface Announcement {
    id: number;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

const StudentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    // NEW: State for the Modal
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/announcements/all');
            const data = await res.json();
            if (data.success) setAnnouncements(data.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 min-h-screen text-slate-200">
            {/* ... Header Section remains same ... */}

	    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Campus <span className="text-blue-500">Bulletin</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                        Stay updated with the latest MentorLog news
                    </p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
                    <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">
                        {announcements.length} Active Posts
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {announcements.map((news) => (
                        <div 
                            key={news.id} 
                            className="group bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-xl hover:shadow-blue-500/5 flex flex-col md:flex-row md:h-62.5"
                        >
                            {/* Image Container */}
                            <div className="h-48 md:h-full md:w-1/3 overflow-hidden relative border-b md:border-b-0 md:border-r border-slate-800">
                                {news.image_url ? (
                                    <img src={`http://localhost:5000${news.image_url}`} alt={news.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700 text-4xl">📰</div>
                                )}
                            </div>

                            {/* Content Container */}
                            <div className="p-6 md:p-8 flex flex-col flex-1 justify-between md:w-2/3">
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase italic tracking-tight group-hover:text-blue-400 transition-colors">{news.title}</h2>
                                    <div className="h-1 w-12 bg-blue-500 my-4 rounded-full"></div>
                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 italic">{news.content}</p>
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-slate-800/50 flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Posted by Administration</span>
                                    {/* UPDATED: Added onClick to open modal */}
                                    <button 
                                        onClick={() => setSelectedAnnouncement(news)}
                                        className="text-blue-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-tighter transition-all"
                                    >
                                        Read Full →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL OVERLAY --- */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                        onClick={() => setSelectedAnnouncement(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-[#1e293b] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-300">
                        {/* Close Button */}
                        <button 
                            onClick={() => setSelectedAnnouncement(null)}
                            className="absolute top-6 right-6 z-10 bg-black/20 hover:bg-black/40 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                        >
                            ✕
                        </button>

                        <div className="flex flex-col">
                            {/* Full Image */}
                            {selectedAnnouncement.image_url && (
                                <div className="w-full h-64 md:h-96">
                                    <img 
                                        src={`http://localhost:5000${selectedAnnouncement.image_url}`} 
                                        className="w-full h-full object-cover" 
                                        alt="full-view"
                                    />
                                </div>
                            )}

                            <div className="p-8 md:p-12 space-y-6">
                                <div className="space-y-2">
                                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">
                                        {new Date(selectedAnnouncement.created_at).toLocaleDateString(undefined, { dateStyle: 'full' })}
                                    </p>
                                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                                        {selectedAnnouncement.title}
                                    </h2>
                                </div>

                                <div className="h-1.5 w-20 bg-blue-600 rounded-full"></div>

                                <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap italic">
                                    {selectedAnnouncement.content}
                                </p>

                                <div className="pt-10 border-t border-slate-800 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                        🛡️
                                    </div>
                                    <div>
                                        <p className="text-white text-xs font-bold uppercase tracking-tight">MentorLog Admin</p>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase">Verified Official Post</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAnnouncements;