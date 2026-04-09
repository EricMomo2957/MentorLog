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

    const formatForInput = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // --- FETCH DATA ---
    const fetchEvents = useCallback(async () => {
        const storedId = localStorage.getItem('id') || 
                         localStorage.getItem('userId') || 
                         JSON.parse(localStorage.getItem('user') || '{}').id;

        if (!storedId) return;

        try {
            const response = await axios.get('http://localhost:5000/api/events', {
                params: { user_id: storedId }
            });
            setEvents(response.data);
        } catch (err) {
            console.error("Error fetching events", err);
        }
    }, []);

    // Fixed Effect logic to prevent sync-state warnings
    useEffect(() => {
        const init = async () => { await fetchEvents(); };
        init();
    }, [fetchEvents]);

    // --- HANDLERS ---
    const handleSaveEvent = async () => {
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
                await axios.put(`http://localhost:5000/api/events/${editId}`, payload);
            } else {
                await axios.post('http://localhost:5000/api/events/add', payload);
            }
            setShowModal(false);
            fetchEvents();
        } catch (err) {
            console.error("Save error", err);
        }
    };

    const handleDeleteEvent = async (id: number | undefined) => {
        if (id === undefined || !window.confirm("Confirm deletion?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/events/${id}`);
            fetchEvents();
        } catch (err) {
            console.error("Delete error", err);
        }
    };

    // --- CALENDAR LOGIC ---
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 bg-[#020617] text-slate-200">
            
            {/* LEDGER HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0f172a] p-8 border border-slate-800 rounded-sm mb-8">
                <div className="space-y-1">
                    <h1 className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">Event Management System</h1>
                    <h2 className="text-4xl font-light text-white tracking-tighter uppercase">
                        {format(currentMonth, 'MMMM')} <span className="font-bold text-blue-500 italic underline decoration-blue-500/30 underline-offset-8">{format(currentMonth, 'yyyy')}</span>
                    </h2>
                    <div className="flex gap-4 pt-2">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-[10px] font-black text-slate-400 hover:text-white border-b border-slate-700 pb-1 uppercase tracking-widest transition-all">← Prev</button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-[10px] font-black text-slate-400 hover:text-white border-b border-slate-700 pb-1 uppercase tracking-widest transition-all">Next →</button>
                    </div>
                </div>

                <button 
                    onClick={() => { setIsEditing(false); setEventData({title:'', description:'', location:'', start_time:'', end_time:''}); setShowModal(true); }}
                    className="px-10 py-4 bg-emerald-500 text-slate-900 rounded-sm font-black uppercase tracking-widest text-[11px] hover:brightness-110 active:scale-95 border border-emerald-400 shadow-lg shadow-emerald-500/10"
                >
                    + Create Event
                </button>
            </div>

            {/* CALENDAR GRID - LEDGER STYLE */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-sm overflow-hidden mb-12 shadow-2xl">
                <div className="grid grid-cols-7 bg-slate-900/50 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-4 border-r border-slate-800 last:border-r-0">{day}</div>)}
                </div>
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                        const dayEvents = events.filter(event => isSameDay(new Date(event.start_time), day));
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                            <div key={idx} className={`min-h-32 p-3 border-r border-b border-slate-800 transition-all ${!isCurrentMonth ? 'bg-slate-900/20 opacity-30' : 'hover:bg-slate-800/30'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-mono font-bold ${isToday ? 'bg-blue-500 text-white px-2 py-0.5' : 'text-slate-500'}`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.map((event, eIdx) => (
                                        <div key={eIdx} onClick={() => { setIsEditing(true); setEditId(event.id || null); setEventData({...event, start_time: formatForInput(event.start_time), end_time: formatForInput(event.end_time)}); setShowModal(true); }}
                                             className="text-[9px] bg-blue-500/5 text-blue-400 p-1 px-2 border border-blue-500/20 font-bold cursor-pointer hover:bg-blue-500/10 truncate">
                                            {event.title.toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* TRANSACTION LOG STYLE TABLE */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-sm overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Upcoming Schedule Ledger</h3>
                    <div className="text-[10px] font-mono text-slate-600 uppercase">{events.length} Records Found</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-900/20">
                                <th className="px-8 py-5">Event Detail</th>
                                <th className="px-8 py-5">Schedule</th>
                                <th className="px-8 py-5">Location</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {events.map((event, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="text-xs font-bold text-slate-200 uppercase">{event.title}</div>
                                        <div className="text-[10px] text-slate-600 mt-1 uppercase italic">{event.description || 'No description provided'}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-xs text-blue-400">{format(new Date(event.start_time), 'yyyy-MM-dd')}</div>
                                        <div className="text-[10px] text-slate-500">{format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[9px] px-2 py-0.5 border border-slate-700 text-slate-500 font-bold uppercase">{event.location || 'INTERNAL'}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-4">
                                        <button onClick={() => { setIsEditing(true); setEditId(event.id || null); setEventData({...event, start_time: formatForInput(event.start_time), end_time: formatForInput(event.end_time)}); setShowModal(true); }} className="text-[10px] font-black text-blue-500 hover:text-white transition-colors uppercase">Edit</button>
                                        <button onClick={() => handleDeleteEvent(event.id)} className="text-[10px] font-black text-slate-700 hover:text-red-500 transition-colors uppercase">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL - LEDGER STYLE */}
            {showModal && (
                <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
                    <div className="bg-[#0f172a] w-full max-w-md border border-slate-700 rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{isEditing ? 'Modify Entry' : 'New Schedule Entry'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors font-mono uppercase text-xs">Close [X]</button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest italic">1. Event Identity</label>
                                <input type="text" value={eventData.title} onChange={(e) => setEventData({...eventData, title: e.target.value})} placeholder="EVENT NAME" className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-3 text-xs font-mono text-white focus:border-blue-500 outline-none uppercase placeholder:text-slate-700" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest italic">2. Location Segment</label>
                                <input type="text" value={eventData.location} onChange={(e) => setEventData({...eventData, location: e.target.value})} placeholder="FACILITY / ROOM" className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-3 text-xs font-mono text-white focus:border-blue-500 outline-none uppercase placeholder:text-slate-700" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest italic">3. Start Date/Time</label>
                                    <input type="datetime-local" value={eventData.start_time} onChange={(e) => setEventData({...eventData, start_time: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-3 text-[10px] font-mono text-white focus:border-blue-500 outline-none scheme-dark" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest italic">4. End Date/Time</label>
                                    <input type="datetime-local" value={eventData.end_time} onChange={(e) => setEventData({...eventData, end_time: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-3 text-[10px] font-mono text-white focus:border-blue-500 outline-none scheme-dark" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-slate-800">
                                <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-800 transition-colors">Discard</button>
                                <button onClick={handleSaveEvent} className="flex-1 px-6 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">Commit Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendar;