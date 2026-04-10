import { useState, useEffect } from 'react';

interface Announcement {
    id: number;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

const ManageAnnouncement = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAnnouncements = async () => {
        const res = await fetch('http://localhost:5000/api/announcements/all');
        const data = await res.json();
        if (data.success) setAnnouncements(data.data);
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) formData.append('image', image);

        try {
            const res = await fetch('http://localhost:5000/api/announcements/create', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData // Note: Don't set Content-Type header when using FormData
            });
            const data = await res.json();
            if (data.success) {
                setTitle(''); setContent(''); setImage(null);
                fetchAnnouncements();
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10 text-slate-200">
            <h1 className="text-3xl font-black uppercase italic border-b border-slate-800 pb-4">
                Bulletin <span className="text-blue-500">Management</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* CREATE FORM */}
                <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Post New Announcement</h2>
                    <input 
                        type="text" placeholder="Announcement Title" value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 transition-all"
                    />
                    <textarea 
                        placeholder="Write details..." rows={4} value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 transition-all"
                    />
                    <div className="border-2 border-dashed border-slate-800 p-6 rounded-xl text-center">
                        <input 
                            type="file" accept="image/*" 
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                            className="text-xs text-slate-500"
                        />
                    </div>
                    <button 
                        className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
                        disabled={loading}
                    >
                        {loading ? 'Uploading...' : 'Publish Announcement'}
                    </button>
                </form>

                {/* PREVIEW LIST */}
                <div className="space-y-4 max-h-150 overflow-y-auto pr-2">
                    {announcements.map(ann => (
                        <div key={ann.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row">
                            {ann.image_url && (
                                <img 
                                    src={`http://localhost:5000${ann.image_url}`} 
                                    className="w-full md:w-32 h-32 object-cover" 
                                    alt="post"
                                />
                            )}
                            <div className="p-4 flex-1">
                                <h3 className="font-bold uppercase text-sm">{ann.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1 italic">{ann.content}</p>
                                <p className="text-[10px] text-slate-700 mt-2">{new Date(ann.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageAnnouncement;