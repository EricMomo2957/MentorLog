import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            
            {/* MODERN HEADER */}
            <div className="relative overflow-hidden bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-4xl border border-slate-700/50 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Academic Planner</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            {format(currentMonth, 'MMMM')} <span className="text-slate-500 font-light">{format(currentMonth, 'yyyy')}</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">←</button>
                        <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white">Today</button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">→</button>
                    </div>

                    <button 
                        onClick={openAddModal} 
                        className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1"
                    >
                        <span className="text-xl transition-transform group-hover:rotate-90">+</span>
                        Create Event
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* CALENDAR MAIN GRID */}
                <div className="lg:col-span-8 xl:col-span-9 bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-6 shadow-inner">
                    <div className="grid grid-cols-7 mb-6">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-[11px] font-bold text-slate-600 uppercase tracking-widest">{d}</div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-3">
                        {days.map((day, i) => {
                            const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day));
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = isSameMonth(day, currentMonth);

                            return (
                                <div 
                                    key={i} 
                                    className={`group min-h-30 p-3 rounded-3xl border transition-all duration-300 relative ${
                                        !isCurrentMonth 
                                        ? 'opacity-10 border-transparent' 
                                        : isToday 
                                          ? 'bg-blue-600/5 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                                          : 'bg-slate-800/20 border-slate-800/50 hover:border-slate-600 hover:bg-slate-800/40'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-sm font-black ${isToday ? 'text-blue-500' : 'text-slate-500'}`}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-1 overflow-y-auto max-h-20 custom-scrollbar">
                                        {dayEvents.slice(0, 3).map(e => (
                                            <div 
                                                key={e.id} 
                                                onClick={() => setSelectedEvent(e)}
                                                className="text-[9px] font-bold p-2 bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded-xl truncate cursor-pointer hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all active:scale-95"
                                            >
                                                {e.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <p className="text-[9px] text-slate-600 font-bold px-1">+{dayEvents.length - 3} more</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* MODERN SIDEBAR */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                    <div className="bg-linear-to-b from-slate-800/50 to-slate-900/50 rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl sticky top-8">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xl font-black text-white">Focus <span className="text-blue-500">View</span></h4>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                        </div>

                        {selectedEvent ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-4">
                                    <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase rounded-lg">
                                        Active Selection
                                    </div>
                                    <h3 className="text-3xl font-black text-white leading-tight">{selectedEvent.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{selectedEvent.description || "No description provided."}</p>
                                    
                                    <div className="pt-4 space-y-3">
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-slate-950/30 p-3 rounded-2xl">
                                            <span className="text-blue-500">📍</span> {selectedEvent.location || "Online / TBD"}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-slate-950/30 p-3 rounded-2xl">
                                            <span className="text-blue-500">🕒</span> {format(new Date(selectedEvent.start_time), 'hh:mm a')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    <button 
                                        onClick={() => openEditModal(selectedEvent)}
                                        className="py-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => selectedEvent.id && handleDelete(selectedEvent.id)}
                                        className="py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold rounded-2xl border border-red-500/20 transition-all"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-slate-800 rounded-3xl">
                                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600 text-xl">✨</div>
                                <div>
                                    <p className="text-white font-bold text-sm">Nothing Selected</p>
                                    <p className="text-slate-600 text-[11px] mt-1 px-4">Click an event in the calendar to view full details.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL IMPLEMENTATION */}
            {isModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black text-white mb-6">
                            {isEditing ? 'Edit Event' : 'New Event'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input 
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                                placeholder="Event Title" 
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                required 
                            />
                            <textarea 
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none h-28 resize-none"
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                            <input 
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none"
                                placeholder="Location"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">Start Time</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white text-xs"
                                        value={formData.start_time}
                                        onChange={e => setFormData({...formData, start_time: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase px-1">End Time</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white text-xs"
                                        value={formData.end_time}
                                        onChange={e => setFormData({...formData, end_time: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all">Save Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCalendar;