import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    ChevronLeft, ChevronRight, Plus, 
    MapPin, Clock, Download, X 
} from 'lucide-react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay 
} from 'date-fns';

interface CalendarEvent {
    id?: number;
    user_id: string;
    title: string;
    description: string;
    location: string;
    start_time: string;
    end_time: string;
}

const StudentCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const API_BASE = "http://localhost:5000/api/events";

    const initialFormState: CalendarEvent = {
        user_id: localStorage.getItem('userId') || '',
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: ''
    };

    const [formData, setFormData] = useState<CalendarEvent>(initialFormState);

    // --- DATA FETCHING ---
    const fetchMyEvents = useCallback(async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        try {
            const response = await axios.get(API_BASE, {
                params: { user_id: userId }
            });
            setEvents(response.data);
        } catch (err) {
            console.error("Error loading personal calendar", err);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            if (isMounted) await fetchMyEvents();
        };
        loadData();
        return () => { isMounted = false; };
    }, [fetchMyEvents]);

    // --- HANDLERS ---
    const openAddModal = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const formatForInput = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return format(date, "yyyy-MM-dd'T'HH:mm");
    };

    const openEditModal = (event: CalendarEvent) => {
        setFormData({
            ...event,
            start_time: formatForInput(event.start_time),
            end_time: formatForInput(event.end_time)
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) return alert("User session expired.");

        const payload = { ...formData, user_id: userId };

        try {
            if (isEditing && formData.id) {
                await axios.put(`${API_BASE}/${formData.id}`, payload);
            } else {
                await axios.post(`${API_BASE}/add`, payload);
            }
            setIsModalOpen(false);
            fetchMyEvents(); 
            setSelectedEvent(null);
        } catch (err) {
            console.error("Error saving event", err);
            alert("Failed to save event.");
        }
    };

    const handleDelete = async (id: number) => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        if (!window.confirm("Are you sure you want to delete your event?")) return;
        
        try {
            await axios.delete(`${API_BASE}/${id}`, { params: { user_id: userId } });
            fetchMyEvents(); 
            setSelectedEvent(null);
        } catch (err) {
            console.error("Error deleting event", err);
            alert("Could not delete event.");
        }
    };

    // --- CALENDAR GENERATION ---
    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth))
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Personal Schedule & Calendar</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage your personal OJT schedule, deadlines, and academic events</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={openAddModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Event</span>
                    </button>

                    <button 
                        onClick={() => alert("Exporting schedule...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2.5 rounded-lg shadow-xs transition-all"
                        title="Export Calendar"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Control Bar (Automoor Style) */}
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

                <span className="text-xs font-mono text-slate-500">
                    {events.length} Scheduled Events
                </span>
            </div>

            {/* Calendar Main Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Calendar Main Grid */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-200 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="py-2.5 border-r border-slate-200/60 last:border-r-0">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7">
                        {days.map((day, i) => {
                            const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day));
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = isSameMonth(day, currentMonth);

                            return (
                                <div 
                                    key={i} 
                                    className={`min-h-24 p-2 border-r border-b border-slate-200/60 transition-all ${!isCurrentMonth ? 'bg-slate-50/50 opacity-40' : 'hover:bg-slate-50/60'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-mono font-bold w-5 h-5 rounded-md flex items-center justify-center ${
                                            isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'
                                        }`}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map(e => (
                                            <div 
                                                key={e.id} 
                                                onClick={() => setSelectedEvent(e)}
                                                className="text-[10px] bg-blue-50 text-blue-700 p-1 px-1.5 rounded-md border border-blue-200 font-semibold cursor-pointer hover:bg-blue-100 transition-colors truncate shadow-2xs"
                                            >
                                                {e.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <p className="text-[9px] text-slate-400 font-semibold px-1">+{dayEvents.length - 3} more</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Focus View Sidebar */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 h-fit sticky top-20">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-900">Event Details & Focus</h3>
                        <p className="text-[11px] text-slate-500">Select any event on the calendar to inspect</p>
                    </div>

                    {selectedEvent ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                                    Selected Event
                                </span>
                                <h4 className="text-base font-bold text-slate-900">{selectedEvent.title}</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{selectedEvent.description || "No description provided."}</p>
                            </div>

                            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{selectedEvent.location || "Online / Internal"}</span>
                                </div>
                                <div className="flex items-center gap-2 font-mono">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                    <span>{format(new Date(selectedEvent.start_time), 'MMM dd, yyyy - hh:mm a')}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-slate-100">
                                <button 
                                    onClick={() => openEditModal(selectedEvent)}
                                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all"
                                >
                                    Edit Event
                                </button>
                                <button 
                                    onClick={() => selectedEvent.id && handleDelete(selectedEvent.id)}
                                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400 text-xs italic">
                            Click an event in the calendar grid to view full details.
                        </div>
                    )}
                </div>
            </div>

            {/* Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h2 className="text-base font-bold text-slate-900">
                                {isEditing ? 'Edit Personal Event' : 'Create New Event'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Event Title</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                    placeholder="Event Title" 
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    required 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Description</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 h-20 outline-none focus:border-blue-500 focus:bg-white resize-none"
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Location</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                    placeholder="Location"
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Start Time</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={formData.start_time}
                                        onChange={e => setFormData({...formData, start_time: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">End Time</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                                        value={formData.end_time}
                                        onChange={e => setFormData({...formData, end_time: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition-all">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-all shadow-xs">Save Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCalendar;