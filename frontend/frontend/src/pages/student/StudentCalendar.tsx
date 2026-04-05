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
    
    const [formData, setFormData] = useState<CalendarEvent>({
        user_id: localStorage.getItem('userId') || '',
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: ''
    });

    // FETCH ONLY STUDENT'S PRIVATE EVENTS
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

    useEffect(() => {
    const loadData = async () => {
        await fetchMyEvents();
    };
    loadData();
}, [fetchMyEvents]); // fetchMyEvents must be wrapped in useCallback (which it is in my previous code)

    // SAVE NEW EVENT
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure userId is present in payload
            const payload = { ...formData, user_id: localStorage.getItem('userId') };
            await axios.post('http://localhost:5000/api/events/add', payload);
            
            setIsModalOpen(false);
            setFormData({ 
                user_id: localStorage.getItem('userId') || '',
                title: '', description: '', location: '', start_time: '', end_time: '' 
            });
            fetchMyEvents(); 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            alert("Failed to save your event. Ensure your backend route /api/events/add is working.");
        }
    };

    // Calendar Navigation
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

    return (
        <div className="p-6 bg-[#0f172a] min-h-screen text-white">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black italic uppercase text-emerald-400 tracking-tighter">
                        My Personal Schedule
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">Manage your own study blocks and tasks</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 uppercase text-sm tracking-widest"
                >
                    + Add My Event
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Calendar Grid */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6 bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
                        <button onClick={prevMonth} className="hover:text-emerald-400 p-2 transition-colors font-bold">← Previous</button>
                        <span className="font-black uppercase tracking-[0.2em] text-emerald-400">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button onClick={nextMonth} className="hover:text-emerald-400 p-2 transition-colors font-bold">Next →</button>
                    </div>

                    <div className="bg-[#1e293b] rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
                        <div className="grid grid-cols-7 bg-slate-900/80 p-4 border-b border-slate-700 text-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7">
                            {days.map((day, i) => {
                                const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day));
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <div key={i} className={`min-h-30 p-2 border-r border-b border-slate-700/40 transition-colors hover:bg-slate-800/30 ${!isCurrentMonth ? 'opacity-20' : ''}`}>
                                        <span className={`text-xs font-bold ${isToday ? 'bg-emerald-500 text-white px-2 py-0.5 rounded-full' : 'text-slate-500'}`}>
                                            {format(day, 'd')}
                                        </span>
                                        <div className="mt-2 space-y-1">
                                            {dayEvents.map((e, idx) => (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => setSelectedEvent(e)}
                                                    className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg text-[9px] font-bold border border-emerald-500/20 truncate cursor-pointer hover:bg-emerald-500/20"
                                                >
                                                    {e.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Event Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-700 shadow-xl h-full min-h-100">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Event Details</h3>
                        
                        {selectedEvent ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h4 className="text-xl font-black text-white leading-tight mb-2 uppercase italic">{selectedEvent.title}</h4>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/5 p-2 rounded-xl">
                                        <span>⏰</span>
                                        {format(new Date(selectedEvent.start_time), 'hh:mm a')} - {format(new Date(selectedEvent.end_time), 'hh:mm a')}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Location</p>
                                        <p className="text-slate-200">{selectedEvent.location || "No location specified"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Notes</p>
                                        <p className="text-slate-400 italic">{selectedEvent.description || "No description provided."}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center opacity-30">
                                <span className="text-5xl mb-4">📍</span>
                                <p className="text-sm font-medium">Select an event to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for adding events */}
            {isModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <form onSubmit={handleSave} className="bg-[#1e293b] w-full max-w-md p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-black mb-6 italic uppercase tracking-tighter text-emerald-400">New Personal Event</h3>
                        <div className="space-y-4">
                            <input 
                                type="text" placeholder="Event Title" required
                                className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-2xl focus:border-emerald-500 outline-none"
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="datetime-local" required
                                    className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-2xl text-xs"
                                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                />
                                <input 
                                    type="datetime-local" required
                                    className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-2xl text-xs"
                                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                />
                            </div>
                            <input 
                                type="text" placeholder="Location"
                                className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-2xl outline-none"
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                            <textarea 
                                placeholder="Description"
                                className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-2xl h-24 resize-none"
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                                Save Event
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)} 
                                className="px-8 py-4 bg-slate-800 rounded-2xl font-bold text-xs uppercase"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default StudentCalendar;