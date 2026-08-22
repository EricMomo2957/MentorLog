import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { 
    ChevronLeft, ChevronRight, Plus, 
    MapPin, Clock, Edit2, Trash2, Search, Download, X
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';

interface CalendarEvent {
    id?: number;
    title: string;
    description: string;
    location: string;
    start_time: string;
    end_time: string;
}

const AdminCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: ''
    });

    const formatForInput = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const fetchEvents = useCallback(async () => {
        const storedId = localStorage.getItem('id') || 
                         localStorage.getItem('userId') || 
                         JSON.parse(localStorage.getItem('user') || '{}').id;

        if (!storedId) return;

        try {
            const response = await api.get('/events', {
                params: { user_id: storedId }
            });
            const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setEvents(data);
        } catch (err) {
            console.error("Error fetching events", err);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        const storedId = localStorage.getItem('id') || localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user') || '{}').id;
        if (!storedId || !eventData.title || !eventData.start_time) return;

        try {
            const payload = {
                ...eventData,
                user_id: parseInt(storedId),
                start_time: eventData.start_time.replace('T', ' '),
                end_time: eventData.end_time ? eventData.end_time.replace('T', ' ') : eventData.start_time.replace('T', ' ')
            };

            if (isEditing && editId) {
                await api.put(`/events/${editId}`, payload);
            } else {
                await api.post('/events/add', payload);
            }
            setShowModal(false);
            fetchEvents();
        } catch (err) {
            console.error("Save error", err);
        }
    };

    const handleDeleteEvent = async (id: number | undefined) => {
        if (id === undefined || !window.confirm("Confirm deletion of this event?")) return;
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (err) {
            console.error("Delete error", err);
        }
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const filteredEvents = events.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Schedule & Calendar</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Schedule evaluation events, company meetings, and training sessions</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { setIsEditing(false); setEventData({title:'', description:'', location:'', start_time:'', end_time:''}); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Event</span>
                    </button>

                    <button 
                        onClick={() => alert("Exporting calendar schedule...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2.5 rounded-lg shadow-xs transition-all"
                        title="Export Calendar"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filter & Control Bar (Automoor Style) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                
                {/* Month Navigator Pills */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 font-mono">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>

                    <button 
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    <button 
                        onClick={() => setCurrentMonth(new Date())}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all"
                    >
                        Today
                    </button>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-200 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-2.5 border-r border-slate-200/60 last:border-r-0">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                        const dayEvents = events.filter(event => isSameDay(new Date(event.start_time), day));
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                            <div key={idx} className={`min-h-24 p-2 border-r border-b border-slate-200/60 transition-all ${!isCurrentMonth ? 'bg-slate-50/50 opacity-40' : 'hover:bg-slate-50/60'}`}>
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className={`text-xs font-mono font-bold w-5 h-5 rounded-md flex items-center justify-center ${
                                        isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'
                                    }`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.map((event, eIdx) => (
                                        <div 
                                            key={eIdx} 
                                            onClick={() => { setIsEditing(true); setEditId(event.id || null); setEventData({...event, start_time: formatForInput(event.start_time), end_time: formatForInput(event.end_time)}); setShowModal(true); }}
                                            className="text-[10px] bg-blue-50 text-blue-700 p-1 px-1.5 rounded-md border border-blue-200 font-semibold cursor-pointer hover:bg-blue-100 transition-colors truncate shadow-2xs"
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SaaS Table Container for Events */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900">Upcoming Events List</h3>
                    <span className="text-xs font-mono text-slate-500">{filteredEvents.length} Events Scheduled</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-4">Event Details ↕</th>
                                <th className="py-3 px-4">Schedule Date ↕</th>
                                <th className="py-3 px-4">Location ↕</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 max-w-xs">
                                            <p className="font-bold text-slate-900 leading-snug">{event.title}</p>
                                            <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{event.description || 'No description specified.'}</p>
                                        </td>
                                        
                                        <td className="py-3.5 px-4 font-mono text-slate-700">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-slate-800">{format(new Date(event.start_time), 'MMM dd, yyyy')}</p>
                                                    <p className="text-[10px] text-slate-400">{format(new Date(event.start_time), 'hh:mm a')} - {format(new Date(event.end_time), 'hh:mm a')}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                {event.location || 'Internal Office'}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => { setIsEditing(true); setEditId(event.id || null); setEventData({...event, start_time: formatForInput(event.start_time), end_time: formatForInput(event.end_time)}); setShowModal(true); }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-all"
                                                    title="Edit Event"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                                                    title="Delete Event"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs italic">
                                        No events scheduled.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Clean White Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h2 className="text-base font-bold text-slate-900">
                                {isEditing ? 'Edit Event Schedule' : 'Create New Event'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEvent} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Event Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={eventData.title} 
                                    onChange={(e) => setEventData({...eventData, title: e.target.value})} 
                                    placeholder="e.g. Weekly Intern Sync" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Location / Room</label>
                                <input 
                                    type="text" 
                                    value={eventData.location} 
                                    onChange={(e) => setEventData({...eventData, location: e.target.value})} 
                                    placeholder="e.g. Conference Room B / Zoom" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Start Date / Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        value={eventData.start_time} 
                                        onChange={(e) => setEventData({...eventData, start_time: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">End Date / Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        value={eventData.end_time} 
                                        onChange={(e) => setEventData({...eventData, end_time: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Description</label>
                                <textarea 
                                    value={eventData.description} 
                                    onChange={(e) => setEventData({...eventData, description: e.target.value})} 
                                    placeholder="Enter event details..." 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 h-20 outline-none focus:border-blue-500 focus:bg-white resize-none" 
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold text-xs hover:bg-blue-700 transition-all shadow-xs"
                                >
                                    Save Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendar;