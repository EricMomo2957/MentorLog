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

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/announcements/all');
            const data = await res.json();
            if (data.success) {
                setAnnouncements(data.data);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 min-h-screen text-slate-200">
            {/* Header Section */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {announcements.map((news, index) => (
                        <div 
                            key={news.id} 
                            className={`group bg-[#1e293b] border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-xl hover:shadow-blue-500/5 ${
                                index === 0 ? 'md:col-span-2 lg:col-span-2 flex flex-col md:flex-row' : ''
                            }`}
                        >
                            {/* Image Container */}
                            <div className={`${index === 0 ? 'md:w-1/2 h-64 md:h-auto' : 'h-48'} overflow-hidden relative`}>
                                {news.image_url ? (
                                    <img 
                                        src={`http://localhost:5000${news.image_url}`} 
                                        alt={news.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700 text-4xl">
                                        📰
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">
                                        {new Date(news.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Content Container */}
                            <div className={`p-8 flex flex-col justify-center ${index === 0 ? 'md:w-1/2' : ''}`}>
                                <h2 className="text-xl font-black text-white uppercase italic tracking-tight group-hover:text-blue-400 transition-colors">
                                    {news.title}
                                </h2>
                                <div className="h-1 w-12 bg-blue-500 my-4 rounded-full"></div>
                                <p className="text-slate-400 text-sm leading-relaxed line-clamp-4 italic">
                                    {news.content}
                                </p>
                                
                                <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        Posted by Administration
                                    </span>
                                    <button className="text-blue-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-tighter transition-all">
                                        Read Full →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {announcements.length === 0 && !loading && (
                <div className="text-center py-32 border-2 border-dashed border-slate-800 rounded-[40px]">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.6em]">No announcements at this time</p>
                </div>
            )}
        </div>
    );
};

export default StudentAnnouncements;