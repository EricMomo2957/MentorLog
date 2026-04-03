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
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: ''
    });

    // --- FETCH EVENTS (Memoized to prevent unnecessary re-renders) ---
    const fetchEvents = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/events');
            setEvents(response.data);
        } catch (err) {
            console.error("Error fetching events", err);
        }
    }, []);

    // --- EFFECT HOOK (Safe loading pattern) ---
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/events');
                if (isMounted) {
                    setEvents(response.data);
                }
            } catch (err) {
                console.error("Error in useEffect fetch:", err);
            }
        };

        loadData();

        return () => {
            isMounted = false; // Cleanup to prevent state updates on unmounted component
        };
    }, [currentMonth]);

    // --- NAVIGATION ---
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleSaveEvent = async () => {
        const userId = localStorage.getItem('id'); 
        try {
            const response = await axios.post('http://localhost:5000/api/events/add', {
                ...eventData,
                user_id: userId
            });
            if (response.data.success) {
                alert("Event Created!");
                setShowModal(false);
                fetchEvents(); // Refresh after adding
            }
        } catch (err) {
            console.error("Error saving event", err);
            alert("Failed to save event.");
        }
    };

    // --- CALENDAR GENERATION LOGIC ---
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-blue-400">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <div className="flex gap-4 mt-2">
                        <button onClick={prevMonth} className="hover:text-blue-400 transition-colors">← Previous</button>
                        <button onClick={nextMonth} className="hover:text-blue-400 transition-colors">Next →</button>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition shadow-lg"
                >
                    + Add New Event
                </button>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-7 bg-gray-700 p-2 text-center text-sm font-bold text-gray-300">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day}>{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 border-t border-gray-700">
                    {calendarDays.map((day, idx) => {
                        const dayEvents = events.filter(event => 
                            isSameDay(new Date(event.start_time), day)
                        );

                        return (
                            <div 
                                key={idx} 
                                className={`min-h-32 p-2 border-r border-b border-gray-700 transition-colors 
                                ${!isSameMonth(day, monthStart) ? 'bg-gray-900/50 text-gray-600' : 'hover:bg-gray-750'}`}
                            >
                                <span className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-blue-400' : ''}`}>
                                    {format(day, 'd')}
                                </span>
                                <div className="mt-1 space-y-1">
                                    {dayEvents.map((event, eIdx) => (
                                        <div key={eIdx} className="text-[10px] bg-blue-900/40 text-blue-200 p-1 rounded truncate border border-blue-700/50">
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-6 text-blue-400">New Event Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">Title</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-900 p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none transition-all"
                                    onChange={(e) => setEventData({...eventData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">Description</label>
                                <textarea 
                                    className="w-full bg-gray-900 p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none transition-all"
                                    onChange={(e) => setEventData({...eventData, description: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold">Location</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-900 p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none transition-all"
                                    onChange={(e) => setEventData({...eventData, location: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Start</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-gray-900 p-2 rounded border border-gray-700 text-sm text-white focus:border-blue-500 outline-none"
                                        onChange={(e) => setEventData({...eventData, start_time: e.target.value})}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="text-xs text-gray-400 uppercase font-bold">End</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-gray-900 p-2 rounded border border-gray-700 text-sm text-white focus:border-blue-500 outline-none"
                                        onChange={(e) => setEventData({...eventData, end_time: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition">Cancel</button>
                            <button 
                                onClick={handleSaveEvent}
                                className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold transition shadow-lg active:scale-95"
                            >
                                Create Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendar;