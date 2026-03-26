import { useState, useEffect } from 'react'; // Removed 'React' to fix unused var warning

interface Task {
    id: number;
    user_id: number;
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    due_date: string;
}

const ManageTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<string>('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                // Simulating an async delay to fix the 'synchronous setState' error
                await new Promise(resolve => setTimeout(resolve, 500));

                setTasks([
                    { id: 1, user_id: 101, title: 'Database Schema', task_description: 'Design the initial ERD', status: 'Completed', due_date: '2026-03-20' },
                    { id: 2, user_id: 102, title: 'API Integration', task_description: 'Connect frontend to Node backend', status: 'In-Progress', due_date: '2026-03-25' },
                    { id: 3, user_id: 101, title: 'Unit Testing', task_description: 'Write tests for Auth routes', status: 'Pending', due_date: '2026-03-30' },
                ]);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const handleStatusUpdate = async (taskId: number, newStatus: Task['status']) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
    };

    const filteredTasks = filter === 'All' ? tasks : tasks.filter(task => task.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'In-Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        }
    };

    if (loading) return <div className="p-8 text-slate-400">Loading tasks...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Task Management</h1>
                    <p className="text-slate-400 mt-1">Review and update student milestones.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    {['All', 'Pending', 'In-Progress', 'Completed'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                filter === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#0f172a]/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800/60 bg-slate-800/20">
                            <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">User</th>
                            <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Task Details</th>
                            <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center">Status</th>
                            <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                        {filteredTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-blue-500/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-sm font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">
                                        ID: {task.user_id}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{task.title}</p>
                                    <p className="text-xs text-slate-500 line-clamp-1 italic font-light">"{task.task_description}"</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {task.status !== 'Completed' ? (
                                        <button 
                                            onClick={() => handleStatusUpdate(task.id, 'Completed')}
                                            className="text-[10px] font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all active:scale-95"
                                        >
                                            Mark Complete
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleStatusUpdate(task.id, 'Pending')}
                                            className="text-[10px] font-bold text-slate-500 hover:text-slate-200 px-3 py-1.5 transition-colors"
                                        >
                                            Re-open
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageTasks;