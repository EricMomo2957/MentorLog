import { useState, useEffect, useCallback } from 'react';
import { 
    Newspaper, Calendar, User, ArrowRight, 
    X, ShieldCheck, Bell, Info, Megaphone
} from 'lucide-react';

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
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/announcements/all');
            const data = await res.json();
            if (data.success) setAnnouncements(data.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error("Failed to sync bulletin ledger");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 min-h-screen text-slate-200 antialiased">
            {/* Ledger Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-10 gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-500 font-bold tracking-[0.3em] text-[10px] uppercase">
                        <Megaphone className="w-4 h-4" />
                        Official Broadcast Channel
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">
                        Campus <span className="text-slate-500 font-light italic">Bulletin</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-400 animate-bounce" />
                    </div>
                    <div>
                        <p className="text-white text-sm font-black tracking-tight">{announcements.length} ACTIVE POSTS</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Registry Updated Live</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-32 text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-mono text-[10px] tracking-[0.4em] uppercase">Fetching Ledger Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {announcements.map((news) => (
                        <div 
                            key={news.id} 
                            onClick={() => setSelectedAnnouncement(news)}
                            className="group cursor-pointer bg-slate-900/30 border border-slate-800/60 rounded-4xl overflow-hidden hover:border-blue-500/40 transition-all duration-500 flex flex-col md:flex-row h-auto md:h-72 shadow-lg hover:shadow-2xl hover:shadow-blue-500/5"
                        >
                            {/* Terminal Image Container */}
                            <div className="h-56 md:h-full md:w-80 overflow-hidden relative border-b md:border-b-0 md:border-r border-slate-800">
                                {news.image_url ? (
                                    <img 
                                        src={`http://localhost:5000${news.image_url}`} 
                                        alt={news.title} 
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1" 
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-800">
                                        <Newspaper className="w-16 h-16" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Info Section */}
                            <div className="p-8 flex flex-col flex-1 justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded tracking-widest uppercase">New Update</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(news.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight leading-tight uppercase italic">
                                        {news.title}
                                    </h2>
                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium">
                                        {news.content}
                                    </p>
                                </div>
                                
                                <div className="mt-8 flex justify-between items-center border-t border-slate-800/50 pt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                                            <ShieldCheck className="w-3 h-3 text-blue-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Official Post</span>
                                    </div>
                                    <button className="flex items-center gap-2 text-blue-500 group-hover:gap-4 transition-all text-xs font-black uppercase tracking-tighter">
                                        Open Record <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODERN MODAL OVERLAY --- */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
                    <div 
                        className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl transition-all"
                        onClick={() => setSelectedAnnouncement(null)}
                    ></div>

                    <div className="relative bg-[#0f172a] w-full max-w-5xl max-h-full overflow-y-auto rounded-[2.5rem] border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* Interactive Header */}
                        <div className="sticky top-0 z-20 flex justify-between items-center p-6 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                                    <Info className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Bulletin Record #{selectedAnnouncement.id}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedAnnouncement(null)}
                                className="bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 w-10 h-10 rounded-full flex items-center justify-center transition-all group"
                            >
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row">
                            {/* Featured Media */}
                            {selectedAnnouncement.image_url && (
                                <div className="w-full lg:w-1/2 p-6">
                                    <div className="aspect-4/5 rounded-4xl overflow-hidden border border-slate-800 shadow-2xl">
                                        <img 
                                            src={`http://localhost:5000${selectedAnnouncement.image_url}`} 
                                            className="w-full h-full object-cover" 
                                            alt="record-media"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Record Content */}
                            <div className={`p-8 lg:p-12 space-y-8 ${selectedAnnouncement.image_url ? 'lg:w-1/2' : 'w-full'}`}>
                                <div className="space-y-4">
                                    <p className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(selectedAnnouncement.created_at).toLocaleDateString(undefined, { dateStyle: 'full' })}
                                    </p>
                                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">
                                        {selectedAnnouncement.title}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-4 py-6 border-y border-slate-800/50">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                        <User className="text-blue-500 w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white text-xs font-black uppercase tracking-widest">Admin Authorization</p>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Verified Registrar Post</p>
                                    </div>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <p className="text-slate-300 text-xl leading-relaxed whitespace-pre-wrap font-medium tracking-tight italic">
                                        {selectedAnnouncement.content}
                                    </p>
                                </div>

                                <div className="pt-10">
                                    <button 
                                        onClick={() => setSelectedAnnouncement(null)}
                                        className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
                                    >
                                        Acknowledge & Close
                                    </button>
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