import { useState, useEffect, useCallback } from 'react';
import { 
    Newspaper, ArrowRight, 
    X, ShieldCheck, Bell, Download, Search
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
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/announcements/all');
            const data = await res.json();
            if (data.success) setAnnouncements(data.data);
        } catch (error) {
            console.error("Failed to sync announcements", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

    const filteredAnnouncements = announcements.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Office Bulletins & News</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Stay updated with company announcements, policy updates, and OJT guidelines</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => alert("Exporting bulletin records...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Bulletins</span>
                    </button>
                </div>
            </div>

            {/* Control Bar (Automoor Style) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span>{announcements.length} Published Bulletins</span>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search bulletins..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-slate-400 text-xs font-medium animate-pulse">
                    Retrieving bulletin records...
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-400 text-xs italic shadow-xs">
                    No office bulletins found matching search criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAnnouncements.map((news) => (
                        <div 
                            key={news.id} 
                            onClick={() => setSelectedAnnouncement(news)}
                            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row cursor-pointer group"
                        >
                            {news.image_url ? (
                                <img 
                                    src={`http://localhost:5000${news.image_url}`} 
                                    alt={news.title} 
                                    className="w-full sm:w-48 h-40 object-cover shrink-0" 
                                />
                            ) : (
                                <div className="w-full sm:w-48 h-40 bg-slate-50 border-r border-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                                    <Newspaper className="w-10 h-10" />
                                </div>
                            )}

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                                            Official Post
                                        </span>
                                        <span className="text-[11px] font-mono text-slate-400">
                                            {new Date(news.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {news.title}
                                    </h2>
                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                        {news.content}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Admin Verified
                                    </span>
                                    <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Read Announcement <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Overlay */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                            <div>
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Official Bulletin</span>
                                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedAnnouncement.title}</h2>
                                <p className="text-xs font-mono text-slate-400">Posted on {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <button onClick={() => setSelectedAnnouncement(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {selectedAnnouncement.image_url && (
                            <img 
                                src={`http://localhost:5000${selectedAnnouncement.image_url}`} 
                                className="w-full max-h-64 object-cover rounded-xl border border-slate-200" 
                                alt="announcement banner"
                            />
                        )}

                        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                            {selectedAnnouncement.content}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setSelectedAnnouncement(null)}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-all shadow-xs"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAnnouncements;