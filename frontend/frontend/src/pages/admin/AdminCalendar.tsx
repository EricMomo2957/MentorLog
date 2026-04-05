import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
    // --- CALENDAR STATE ---
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: ''
    });
    
    // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatForInput = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // --- 1. FETCH EVENTS ---
    const fetchEvents = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/events');
            setEvents(response.data);
        } catch (err) {
            console.error("Error fetching events", err);
        }
    }, []);

    // --- 2. EFFECT HOOK ---
    // Replace your current useEffect with this:
    useEffect(() => {
        const loadData = async () => {
            await fetchEvents();
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- 3. HANDLERS ---
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleEditClick = (event: CalendarEvent) => {
        setIsEditing(true);
        setEditId(event.id || null);
        setEventData({
            title: event.title,
            description: event.description || '',
            location: event.location || '',
            start_time: formatForInput(event.start_time),
            end_time: formatForInput(event.end_time)
        });
        setShowModal(true);
    };

    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setEditId(null);
        setEventData({ title: '', description: '', location: '', start_time: '', end_time: '' });
        setShowModal(true);
    };

    const handleSaveEvent = async () => {
        // Robust check for User ID
        const storedId = localStorage.getItem('id') || 
                         localStorage.getItem('userId') || 
                         JSON.parse(localStorage.getItem('user') || '{}').id;

        if (!storedId) {
            alert("Error: User ID not found. Please log in again.");
            return;
        }

        if (!eventData.title || !eventData.start_time) {
            alert("Please provide at least a title and start time.");
            return;
        }

        try {
            const payload = {
                ...eventData,
                user_id: parseInt(storedId),
                // Replace 'T' with space for MySQL compatibility
                start_time: eventData.start_time.replace('T', ' '),
                end_time: eventData.end_time ? eventData.end_time.replace('T', ' ') : eventData.start_time.replace('T', ' ')
            };

            let response;
            if (isEditing && editId) {
                response = await axios.put(`http://localhost:5000/api/events/${editId}`, payload);
            } else {
                response = await axios.post('http://localhost:5000/api/events/add', payload);
            }

            if (response.status === 200 || response.status === 201 || response.data.success) {
                alert(isEditing ? "Event Updated!" : "Event Created!");
                setShowModal(false);
                fetchEvents(); 
            }
        } catch (err) {
            console.error("Error saving event", err);
            alert("Failed to save event. Check connection and permissions.");
        }
    };

    // --- NEW DELETE HANDLER ---
    const handleDeleteEvent = async (id: number | undefined) => {
        if (!id) return;
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
        
        try {
            const response = await axios.delete(`http://localhost:5000/api/events/${id}`);
            if (response.status === 200 || response.data.success) {
                alert("Event deleted successfully");
                fetchEvents(); // Refresh the list and calendar
            }
        } catch (err) {
            console.error("Error deleting event", err);
            alert("Failed to delete event.");
        }
    };

    // --- 4. CALENDAR LOGIC ---
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="p-6 bg-[#020617] min-h-screen text-slate-200 space-y-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white italic">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <div className="flex gap-6 mt-3">
                        <button onClick={prevMonth} className="text-slate-400 hover:text-blue-400 font-bold transition-all text-sm uppercase tracking-widest">← Prev</button>
                        <button onClick={nextMonth} className="text-slate-400 hover:text-blue-400 font-bold transition-all text-sm uppercase tracking-widest">Next →</button>
                    </div>
                </div>
                <button 
                    onClick={handleOpenCreateModal}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    + NEW EVENT
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-4xl border border-slate-800/60 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-7 bg-slate-800/40 p-4 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800/60">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                        const dayEvents = events.filter(event => isSameDay(new Date(event.start_time), day));
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div key={idx} className={`min-h-32 p-3 border-r border-b border-slate-800/40 transition-all ${!isCurrentMonth ? 'bg-slate-900/30 text-slate-700' : 'hover:bg-slate-800/30'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-bold ${isToday ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full' : ''}`}>{format(day, 'd')}</span>
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.map((event, eIdx) => (
                                        <div key={eIdx} onClick={() => handleEditClick(event)} className="text-[10px] bg-blue-500/10 text-blue-400 p-1.5 rounded-lg truncate border border-blue-500/20 font-bold cursor-pointer hover:bg-blue-500/20">
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming Schedule Table */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-white italic tracking-tight">Upcoming Schedule</h3>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">{events.length} Total</span>
                </div>
                
                <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl border border-slate-800/60 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/40 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                                <th className="p-5 border-b border-slate-800/60">Event Title</th>
                                <th className="p-5 border-b border-slate-800/60">Date & Time</th>
                                <th className="p-5 border-b border-slate-800/60">Location</th>
                                <th className="p-5 border-b border-slate-800/60 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {events.map((event, idx) => (
                                <tr key={idx} className="group hover:bg-blue-500/5 transition-colors">
                                    <td className="p-5">
                                        <div className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{event.title}</div>
                                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">{event.description || 'No description'}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-sm font-medium text-slate-300">
                                            {format(new Date(event.start_time), 'MMM d, yyyy')}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">
                                            {format(new Date(event.start_time), 'hh:mm a')}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-xs px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-slate-400 font-bold">{event.location || 'N/A'}</span>
                                    </td>
                                    <td className="p-5 text-right space-x-4">
                                        <button onClick={() => handleEditClick(event)} className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors">Edit</button>
                                        <button onClick={() => handleDeleteEvent(event.id)} className="text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-10 w-full max-w-md border border-slate-800 shadow-2xl">
                        <h3 className="text-3xl font-black text-white mb-2 italic">
                            {isEditing ? 'Edit Event' : 'Schedule Event'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-8 font-medium">
                            {isEditing ? 'Make your changes below.' : 'Create a new campus event.'}
                        </p>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Event Title</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter event name"
                                    value={eventData.title}
                                    className="w-full bg-slate-900/50 p-4 rounded-2xl border border-slate-800 focus:border-blue-500 outline-none text-white"
                                    onChange={(e) => setEventData({...eventData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Location</label>
                                <input 
                                    type="text" 
                                    placeholder="Room or Building"
                                    value={eventData.location}
                                    className="w-full bg-slate-900/50 p-4 rounded-2xl border border-slate-800 focus:border-blue-500 outline-none text-white"
                                    onChange={(e) => setEventData({...eventData, location: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Start Time</label>
                                    <input 
                                        type="datetime-local" 
                                        value={eventData.start_time}
                                        className="w-full bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-sm text-white focus:border-blue-500 outline-none scheme-dark"
                                        onChange={(e) => setEventData({...eventData, start_time: e.target.value})}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">End Time</label>
                                    <input 
                                        type="datetime-local" 
                                        value={eventData.end_time}
                                        className="w-full bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-sm text-white focus:border-blue-500 outline-none scheme-dark"
                                        onChange={(e) => setEventData({...eventData, end_time: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 mt-10">
                            <button onClick={handleSaveEvent} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all">
                                {isEditing ? 'SAVE CHANGES' : 'CONFIRM & CREATE'}
                            </button>
                            <button onClick={() => setShowModal(false)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-bold text-sm transition-all">
                                DISCARD
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendar;