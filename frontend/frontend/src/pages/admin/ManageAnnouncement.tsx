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
    const [editingId, setEditingId] = useState<number | null>(null); // New State

    const fetchAnnouncements = async () => {
        const res = await fetch('http://localhost:5000/api/announcements/all');
        const data = await res.json();
        if (data.success) setAnnouncements(data.data);
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    // Load data into form for editing
    const handleEditInitiate = (ann: Announcement) => {
        setEditingId(ann.id);
        setTitle(ann.title);
        setContent(ann.content);
        setImage(null); // Reset image input
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this announcement permanently?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/announcements/delete/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) fetchAnnouncements();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error("Delete failed");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) formData.append('image', image);

        // Determine if we are creating or updating
        const url = editingId 
            ? `http://localhost:5000/api/announcements/update/${editingId}`
            : 'http://localhost:5000/api/announcements/create';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setTitle(''); setContent(''); setImage(null); setEditingId(null);
                fetchAnnouncements();
                alert(editingId ? "Update Successful" : "Published Successful");
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error("Operation failed");
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
                <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 space-y-4 h-fit sticky top-6">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                        {editingId ? 'Edit Announcement' : 'Post New Announcement'}
                    </h2>
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
                        <p className="text-[10px] text-slate-500 mb-2 uppercase">Optional: Upload New Image</p>
                        <input 
                            type="file" accept="image/*" 
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                            className="text-xs text-slate-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            className={`flex-1 ${editingId ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'} py-4 rounded-xl font-black uppercase tracking-widest transition-all`}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : editingId ? 'Update Post' : 'Publish Announcement'}
                        </button>
                        {editingId && (
                            <button 
                                type="button"
                                onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
                                className="bg-slate-700 px-6 rounded-xl font-bold uppercase text-xs"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                    {announcements.map(ann => (
                        <div key={ann.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col group">
                            <div className="flex flex-col md:flex-row">
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
                            {/* ACTION BUTTONS */}
                            <div className="bg-[#111827] p-2 flex justify-end gap-2 border-t border-slate-800">
                                <button 
                                    onClick={() => handleEditInitiate(ann)}
                                    className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 bg-slate-800 text-blue-400 rounded hover:bg-slate-700 transition-colors"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(ann.id)}
                                    className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 bg-slate-800 text-red-500 rounded hover:bg-red-900/20 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageAnnouncement;