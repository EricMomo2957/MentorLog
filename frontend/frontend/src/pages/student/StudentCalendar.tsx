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
            const response = await axios.get(`http://localhost:5000/api/events/user/${userId}`);
            setEvents(response.data);
        } catch (err) {
            console.error("Error loading personal calendar", err);
        }
    }, []);

    // Memoized fetch call on mount and whenever function identity changes
    useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
        // Adding a check ensures we only update state if the component is still active
        if (isMounted) {
            await fetchMyEvents();
        }
    };

    loadData();

    return () => {
        isMounted = false;
    };
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
                // Hits the student-specific update route
                await axios.put(`http://localhost:5000/api/events/user/update/${formData.id}`, payload);
            } else {
                await axios.post('http://localhost:5000/api/events/add', payload);
            }
            
            setIsModalOpen(false);
            // Refresh UI
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
            // Hits the student-specific delete route with validation parameters
            await axios.delete(`http://localhost:5000/api/events/user/delete/${id}/${userId}`);
            
            // Refresh UI immediately
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
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-xl">
                <div>
                    <h1 className="text-3xl font-black text-white">My <span className="text-blue-500">Schedule</span></h1>
                    <p className="text-slate-400 font-medium">{format(currentMonth, 'MMMM yyyy')}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700">←</button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700">→</button>
                    <button onClick={openAddModal} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg transition-all">+ Add Event</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* CALENDAR GRID */}
                <div className="lg:col-span-3 bg-[#1e293b] rounded-3xl border border-slate-800 p-4 shadow-2xl">
                    <div className="grid grid-cols-7 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {days.map((day, i) => {
                            const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day));
                            return (
                                <div 
                                    key={i} 
                                    className={`min-h-30 p-2 rounded-2xl border transition-all ${
                                        !isSameMonth(day, currentMonth) ? 'opacity-20 border-transparent' : 'bg-slate-900/40 border-slate-800 hover:border-blue-500/50'
                                    }`}
                                >
                                    <p className={`text-sm font-bold mb-1 ${isSameDay(day, new Date()) ? 'text-blue-500' : 'text-slate-500'}`}>
                                        {format(day, 'd')}
                                    </p>
                                    {dayEvents.map(e => (
                                        <div 
                                            key={e.id} 
                                            onClick={() => setSelectedEvent(e)}
                                            className="text-[10px] p-1.5 mb-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg truncate cursor-pointer hover:bg-blue-500 hover:text-white transition-all"
                                        >
                                            {e.title}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SIDEBAR / EVENT DETAILS */}
                <div className="bg-[#1e293b] rounded-3xl border border-slate-800 p-6 shadow-2xl">
                    <h4 className="text-lg font-bold text-white mb-4">Event Details</h4>
                    {selectedEvent ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700">
                                <h3 className="text-xl font-bold text-blue-400">{selectedEvent.title}</h3>
                                <p className="text-sm text-slate-400 mt-2">{selectedEvent.description}</p>
                                <div className="mt-4 space-y-2 text-xs font-mono text-slate-500">
                                    <p>📍 {selectedEvent.location}</p>
                                    <p>🕒 {format(new Date(selectedEvent.start_time), 'p')} - {format(new Date(selectedEvent.end_time), 'p')}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => openEditModal(selectedEvent)}
                                    className="py-3 bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => selectedEvent.id && handleDelete(selectedEvent.id)}
                                    className="py-3 bg-red-500/10 text-red-500 border border-red-500/30 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm italic text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                            Select an event to view details
                        </p>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl p-8">
                        <h2 className="text-2xl font-black text-white mb-6">
                            {isEditing ? 'Edit Event' : 'New Event'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                placeholder="Title" 
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                required 
                            />
                            <textarea 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none h-24"
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                            <input 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                placeholder="Location"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Start</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs"
                                        value={formData.start_time}
                                        onChange={e => setFormData({...formData, start_time: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">End</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs"
                                        value={formData.end_time}
                                        onChange={e => setFormData({...formData, end_time: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Save Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCalendar;