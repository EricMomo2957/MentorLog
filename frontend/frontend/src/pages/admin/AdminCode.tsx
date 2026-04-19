import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Key, Plus, Trash2, RefreshCcw, ShieldCheck, Copy } from 'lucide-react';

interface AdminCode {
    id: number;
    code: string;
    is_used: boolean;
    created_at: string;
}

const AdminCode = () => {
    const [codes, setCodes] = useState<AdminCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Helper to safely extract error messages without using 'any'
    const getErrorMessage = (err: unknown): string => {
        if (axios.isAxiosError(err)) {
            return err.response?.data?.message || err.message || 'Server error occurred.';
        }
        return 'An unexpected error occurred.';
    };

    const fetchCodes = useCallback(async () => {
        setLoading(true);
        setError(''); 
        try {
            const response = await axios.get('http://localhost:5000/api/admin/admin-codes', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCodes(response.data);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const handleGenerate = async () => {
        setError('');
        try {
            await axios.post('http://localhost:5000/api/admin/admin-codes', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchCodes(); 
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            console.error("Generation Error:", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this code?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/admin-codes/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCodes(prev => prev.filter(c => c.id !== id));
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        alert('Code copied to clipboard!');
    };

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <ShieldCheck className="text-blue-500 w-8 h-8" />
                        Admin Access Management
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        Generate and manage reference codes for new administrator registrations.
                    </p>
                </div>
                
                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    {loading ? 'Generating...' : 'Generate New Code'}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                    <span>⚠️</span> {error}
                </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50">
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Reference Code</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Created At</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading && codes.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium italic">Loading security codes...</td></tr>
                            ) : codes.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No admin codes found.</td></tr>
                            ) : (
                                codes.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <button 
                                                onClick={() => copyToClipboard(item.code)}
                                                className="flex items-center gap-3 group"
                                            >
                                                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                                    <Key className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <code className="text-sm font-mono font-bold text-blue-100 tracking-wider group-hover:text-blue-400 transition-colors">
                                                    {item.code}
                                                </code>
                                                <Copy className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                                item.is_used 
                                                ? 'bg-slate-800 text-slate-500' 
                                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            }`}>
                                                {item.is_used ? 'Consumed' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400 font-medium">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    Secure Code Management System v1.0
                </p>
                <button 
                    onClick={fetchCodes}
                    className="p-2 text-slate-500 hover:text-emerald-400 transition-colors"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default AdminCode;