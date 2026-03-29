import { useState, useEffect, useCallback } from 'react';
import StudentLayout from './StudentLayout';

// --- TYPES & CONSTANTS ---
interface Task {
    id: number;
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    due_date: string;
}

type FilterType = 'All' | 'Pending' | 'In-Progress' | 'Completed';

// Move constants outside to keep them stable and fix ESLint dependency warnings
const PHP_BRIDGE_URL = 'http://localhost/MentorLog/php-bridge';

const MyTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('All');

    const userId = localStorage.getItem('userId');

    const fetchTasks = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await fetch(`${PHP_BRIDGE_URL}/get-my-tasks.php?user_id=${userId}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setTasks(data);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]); // PHP_BRIDGE_URL removed from here as it is now global

    // Changed FilterType to Task['status'] to match the interface exactly
    const updateStatus = async (taskId: number, newStatus: Task['status']) => {
        try {
            const response = await fetch(`${PHP_BRIDGE_URL}/update-task-status.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, status: newStatus })
            });
            if (response.ok) {
                fetchTasks(); 
            }
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update task status.");
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
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white">My <span className="text-emerald-500">Tasks</span></h1>
                        <p className="text-slate-400 text-sm">Manage and track your assigned OJT objectives.</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                        {(['All', 'Pending', 'In-Progress', 'Completed'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    filter === f ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                    </div>
                ) : filteredTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTasks.map((task) => (
                            <div key={task.id} className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl hover:border-slate-600 transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                        task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                        {task.status}
                                    </span>
                                    <p className="text-slate-500 text-xs font-mono">ID: #{task.id}</p>
                                </div>
                                
                                <h3 className="text-lg font-bold text-white mb-2">{task.title}</h3>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-3">{task.task_description}</p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                                    <div className="text-xs">
                                        <p className="text-slate-500 uppercase font-black text-[9px]">Deadline</p>
                                        <p className="text-slate-300 font-bold">{task.due_date}</p>
                                    </div>

                                    {task.status !== 'Completed' && (
                                        <button 
                                            onClick={() => updateStatus(task.id, 'Completed')}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-900/20"
                                        >
                                            Mark as Done
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#1e293b] border border-dashed border-slate-700 rounded-3xl p-20 text-center">
                        <p className="text-slate-500 italic">No tasks found for this category.</p>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default MyTasks;