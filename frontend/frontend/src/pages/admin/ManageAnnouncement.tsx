import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Megaphone, Image, Plus, Trash2, Edit3, CheckCircle2, 
    Search, Filter, Download, X
} from 'lucide-react';

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
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements/all');
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const handleEditInitiate = (ann: Announcement) => {
        setEditingId(ann.id);
        setTitle(ann.title);
        setContent(ann.content);
        setImage(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this announcement permanently?")) return;
        try {
            const res = await api.delete(`/announcements/delete/${id}`);
            if (res.data?.success) fetchAnnouncements();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) formData.append('image', image);

        const endpoint = editingId 
            ? `/announcements/update/${editingId}`
            : '/announcements/create';

        try {
            const res = editingId 
                ? await api.put(endpoint, formData)
                : await api.post(endpoint, formData);

            if (res.data?.success) {
                setTitle(''); setContent(''); setImage(null); setEditingId(null);
                fetchAnnouncements();
            }
        } catch (error) {
            console.error("Operation failed", error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (urlPath: string) => {
        if (!urlPath) return '';
        if (urlPath.startsWith('http')) return urlPath;
        const clean = urlPath.replace(/\\/g, '/');
        return clean.startsWith('/') ? `http://localhost:5000${clean}` : `http://localhost:5000/${clean}`;
    };

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
                    <p className="text-xs text-slate-500 mt-0.5">Publish company announcements, policy updates, and intern directives</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => alert("Exporting announcements...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Bulletins</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form Card Section */}
                <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 h-fit sticky top-20">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-base font-bold text-slate-900">
                            {editingId ? 'Edit Bulletin Post' : 'Create New Announcement'}
                        </h2>
                        <p className="text-[11px] text-slate-500">Fill in title, content, and optional banner image</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Announcement Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Midterm Evaluation Schedule" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Bulletin Content</label>
                        <textarea 
                            placeholder="Write message content..." 
                            rows={4} 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white resize-none"
                        />
                    </div>

                    <div className="border border-dashed border-slate-200 hover:border-blue-500 p-4 rounded-xl text-center bg-slate-50 transition-colors">
                        <Image className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <p className="text-[11px] font-semibold text-slate-600 mb-1">Optional Header Banner</p>
                        <input 
                            type="file" accept="image/*" 
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                            className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button 
                            type="submit"
                            disabled={loading}
                            className={`flex-1 ${editingId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-xs disabled:opacity-50`}
                        >
                            {loading ? 'Processing...' : editingId ? 'Update Post' : 'Publish Bulletin'}
                        </button>
                        {editingId && (
                            <button 
                                type="button"
                                onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {/* Announcement Cards List */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Search Bar for Bulletins */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search published bulletins..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 shadow-xs"
                        />
                    </div>

                    {filteredAnnouncements.length > 0 ? (
                        filteredAnnouncements.map(ann => (
                            <div key={ann.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group">
                                <div className="flex flex-col sm:flex-row">
                                    {ann.image_url && (
                                        <img 
                                            src={getImageUrl(ann.image_url)} 
                                            className="w-full sm:w-40 h-36 object-cover" 
                                            alt="post header"
                                        />
                                    )}
                                    <div className="p-5 flex-1 space-y-1.5">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{ann.title}</h3>
                                            <span className="text-[10px] text-slate-400 font-mono">{new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{ann.content}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50/80 px-5 py-2.5 flex justify-end gap-2 border-t border-slate-100">
                                    <button 
                                        onClick={() => handleEditInitiate(ann)}
                                        className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 rounded-md transition-all flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(ann.id)}
                                        className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 rounded-md transition-all flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs italic shadow-xs">
                            No office bulletins published yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageAnnouncement;