import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Info, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import api from '../services/api';

interface NotificationItem {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean | number;
    created_at: string;
}

export const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data?.success) {
                setNotifications(res.data.data || []);
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch (err) {
            console.error("Notifications Fetch Error:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Mark Read Error:", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Mark All Read Error:", err);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
            case 'error':
                return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
            default:
                return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all focus:outline-none"
                title="Notifications"
            >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center animate-pulse border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">Notifications</h4>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllRead}
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Mark all as read</span>
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-1">
                                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1 mb-2" />
                                <p>No notifications yet</p>
                                <p className="text-[10px] text-slate-400">Updates will appear here automatically</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const isUnread = !n.is_read;
                                return (
                                    <div 
                                        key={n.id} 
                                        className={`p-3.5 transition-colors flex items-start gap-3 relative group ${
                                            isUnread ? 'bg-blue-50/30 font-medium' : 'hover:bg-slate-50/80'
                                        }`}
                                    >
                                        <div className="mt-0.5">
                                            {getTypeIcon(n.type)}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-xs font-bold text-slate-900 leading-tight">{n.title}</p>
                                            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{n.message}</p>
                                            <p className="text-[9px] text-slate-400 font-mono mt-1">
                                                {new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>

                                        {isUnread && (
                                            <button 
                                                onClick={() => handleMarkAsRead(n.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100"
                                                title="Mark as read"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
