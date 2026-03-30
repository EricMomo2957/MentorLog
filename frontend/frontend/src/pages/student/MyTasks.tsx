import { useState, useEffect, useCallback } from 'react';
import StudentLayout from './StudentLayout';

// --- TYPES & CONSTANTS ---
interface Task {
    id: number;
    user_id: number;
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    due_date: string;
}

type FilterType = 'All' | 'Pending' | 'In-Progress' | 'Completed';

const PHP_BRIDGE_URL = 'http://localhost/MentorLog/php-bridge';

const MyTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('All');

    // Retrieve userId from localStorage
    const userId = localStorage.getItem('userId') || localStorage.getItem('id');

    const fetchTasks = useCallback(async () => {
        if (!userId) {
            console.error("No User ID found in storage. Ensure you are logged in.");
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch(`${PHP_BRIDGE_URL}/get-my-tasks.php?user_id=${userId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resData = await response.json();
            
            // --- DEBUG LOG ---
            console.log("Full Backend Response:", resData);

            if (resData.status === "success") {
                // Ensure we handle cases where data might be null or undefined
                setTasks(resData.data || []);
            } else {
                console.error("Backend logic error:", resData.message);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const updateStatus = async (taskId: number, newStatus: Task['status']) => {
        try {
            const response = await fetch(`${PHP_BRIDGE_URL}/update-task-status.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, status: newStatus })
            });
            
            const resData = await response.json();
            console.log("Update Status Response:", resData);

            if (resData.status === "success") {
                fetchTasks(); // Refresh the list after successful update
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Update failed:", error.message);
            }
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = tasks.filter(t => 
        filter === 'All' ? true : t.status === filter
    );

    return (
        <StudentLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                            My <span className="text-emerald-500">Tasks</span>
                        </h1>
                        <p className="text-slate-400 text-sm">Manage and track your assigned OJT objectives.</p>
                    </div>

                    {/* Filter Navigation */}
                    <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50 backdrop-blur-md">
                        {(['All', 'Pending', 'In-Progress', 'Completed'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
                                    filter === f 
                                    ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' 
                                    : 'text-slate-500 hover:text-white hover:bg-slate-700/30'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-slate-800"></div>
                            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Tasks...</p>
                    </div>
                ) : filteredTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredTasks.map((task) => (
                            <div key={task.id} className="bg-[#1e293b]/50 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/30 transition-all group flex flex-col relative overflow-hidden">
                                <div className="flex justify-between items-start mb-5 relative z-10">
                                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                        task.status === 'Completed' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                        {task.status}
                                    </span>
                                    <p className="text-slate-600 text-[10px] font-mono">TASK_REF: {task.id}</p>
                                </div>
                                
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{task.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3">{task.task_description}</p>
                                
                                <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-900 rounded-lg text-lg">📅</div>
                                        <div>
                                            <p className="text-slate-500 uppercase font-black text-[8px] tracking-widest">Target Date</p>
                                            <p className="text-slate-200 text-xs font-bold">{task.due_date}</p>
                                        </div>
                                    </div>

                                    {task.status !== 'Completed' && (
                                        <button 
                                            onClick={() => updateStatus(task.id, 'Completed')}
                                            className="bg-emerald-600 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all active:scale-95 shadow-lg shadow-emerald-900/40"
                                        >
                                            Complete Task
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#1e293b]/30 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-24 text-center">
                        <div className="text-4xl mb-4 opacity-20">📂</div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">No workspace activity found.</p>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default MyTasks;