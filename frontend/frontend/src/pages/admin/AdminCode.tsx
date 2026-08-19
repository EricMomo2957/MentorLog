import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { 
    Plus, Trash2, RefreshCcw, 
    ShieldCheck, Copy, User, Calendar, 
    CheckCircle2, Clock, Hash
} from 'lucide-react';

interface AdminCode {
    id: number;
    code: string;
    is_used: boolean;
    created_at: string;
    created_by_name?: string;
}

const AdminCode = () => {
    const [codes, setCodes] = useState<AdminCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const fetchCodes = useCallback(async () => {
        setLoading(true);
        setError(''); 
        try {
            const response = await api.get('/admin/admin-codes');
            const codeData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setCodes(codeData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch reference codes.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            await api.post('/admin/admin-codes', {});
            fetchCodes();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate code.');
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Permanently revoke and delete this reference code?")) return;
        try {
            await api.delete(`/admin/admin-codes/${id}`);
            fetchCodes();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete code.');
        }
    };

    const copyToClipboard = (code: string, id: number) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 antialiased">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-500 font-bold tracking-[0.2em] text-xs uppercase">
                        <ShieldCheck className="w-4 h-4" />
                        Authentication Ledger
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Access <span className="text-slate-500 font-light">Registry</span>
                    </h1>
                </div>
                
                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="group relative flex items-center gap-3 bg-white text-black font-black py-4 px-8 rounded-full transition-all hover:bg-blue-500 hover:text-white active:scale-95 disabled:opacity-50"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    {loading ? 'PROCESSING...' : 'INITIALIZE NEW CODE'}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 rounded-r-xl text-sm font-bold flex items-center gap-3">
                    <span>SYSTEM ALERT:</span> {error}
                </div>
            )}

            {/* Ledger Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-800">
                <div className="space-y-1">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Entries</p>
                    <p className="text-xl font-mono text-white">{codes.length.toString().padStart(2, '0')}</p>
                </div>
                <div className="space-y-1 border-l border-slate-800 pl-4">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Active Links</p>
                    <p className="text-xl font-mono text-emerald-500">{codes.filter(c => !c.is_used).length.toString().padStart(2, '0')}</p>
                </div>
                <div className="hidden md:block space-y-1 border-l border-slate-800 pl-4">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Security Level</p>
                    <p className="text-xl font-mono text-blue-400">AES-256</p>
                </div>
                <div className="hidden md:block space-y-1 border-l border-slate-800 pl-4">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Registry Sync</p>
                    <p className="text-xl font-mono text-slate-300">LIVE</p>
                </div>
            </div>

            {/* Ledger List */}
            <div className="space-y-3">
                {loading && codes.length === 0 ? (
                    <div className="py-20 text-center animate-pulse">
                        <RefreshCcw className="w-10 h-10 text-slate-700 mx-auto animate-spin mb-4" />
                        <p className="text-slate-500 font-mono text-sm tracking-tighter">SYNCHRONIZING LEDGER...</p>
                    </div>
                ) : codes.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                        <p className="text-slate-600 font-medium">Ledger is empty. No access codes recorded.</p>
                    </div>
                ) : (
                    codes.map((item) => (
                        <div 
                            key={item.id} 
                            className="group relative flex flex-col md:flex-row items-center gap-6 bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl transition-all hover:bg-slate-800/40 hover:border-blue-500/30 shadow-sm"
                        >
                            {/* Reference Number */}
                            <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-500">
                                {item.id}
                            </div>

                            {/* Code Column */}
                            <div className="flex-1 flex flex-col gap-1 w-full md:w-auto">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <Hash className="w-3 h-3" /> Secure Reference
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-mono font-black text-white tracking-tighter">
                                        {item.code}
                                    </span>
                                    <button 
                                        onClick={() => copyToClipboard(item.code, item.id)}
                                        className={`p-1.5 rounded-lg transition-all ${copiedId === item.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-600 hover:text-blue-400 hover:bg-blue-500/10'}`}
                                    >
                                        {copiedId === item.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 md:flex md:items-center gap-8 w-full md:w-auto">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Origin</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                                        <User className="w-3 h-3 text-blue-500" />
                                        {item.created_by_name || 'ROOT'}
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timestamp</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                                        <Calendar className="w-3 h-3 text-blue-500" />
                                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {/* Status Tag */}
                            <div className="w-full md:w-32 flex justify-start md:justify-center">
                                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    item.is_used 
                                    ? 'bg-slate-950 text-slate-600 border-slate-800' 
                                    : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                }`}>
                                    {item.is_used ? <Clock className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                    {item.is_used ? 'VOIDED' : 'VALID'}
                                </div>
                            </div>

                            {/* Delete Action */}
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="absolute top-4 right-4 md:static p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Registry Info */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4 border-t border-slate-900">
                <div className="flex items-center gap-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    <span>Build 04.20.2026</span>
                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                    <span>Encrypted Connection</span>
                </div>
                <button 
                    onClick={fetchCodes}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-400 transition-all uppercase tracking-tighter"
                >
                    <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Node
                </button>
            </div>
        </div>
    );
};

export default AdminCode;