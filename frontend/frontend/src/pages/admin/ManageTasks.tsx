import React, { useState, useEffect } from 'react';

interface User {
    id: number;
    full_name: string;
    role: 'admin' | 'student';
}

interface Task {
    id: number;
    user_id: number;
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed';
    due_date: string;
    student_name?: string; 
}

const ManageTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [filter, setFilter] = useState<string>('All');
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState({
        user_id: '',
        title: '',
        task_description: '',
        due_date: '',
        status: 'Pending' as Task['status']
    });

    // 1. Optimized Fetch: Real Data from Database
    useEffect(() => {
        const fetchDatabaseData = async () => {
            setLoading(true);
            try {
                const [studentRes, taskRes] = await Promise.all([
                    fetch('http://localhost/mentorlog-api/get-students.php'),
                    fetch('http://localhost/mentorlog-api/get-tasks.php')
                ]);

                if (studentRes.ok && taskRes.ok) {
                    const studentData = await studentRes.json();
                    const taskData = await taskRes.json();
                    setStudents(studentData);
                    setTasks(taskData);
                } else {
                    console.error("Server returned an error:", studentRes.status, taskRes.status);
                }
            } catch (err) {
                console.error("Database connection failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDatabaseData();
    }, []);

    // 2. Quick Toggle Status logic
    const toggleStatus = async (task: Task) => {
        const statusOrder: Task['status'][] = ['Pending', 'In-Progress', 'Completed'];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

        try {
            const response = await fetch('http://localhost/mentorlog-api/update-task.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...task,
                    status: nextStatus
                })
            });

            if (response.ok) {
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
            }
        } catch (err) {
            console.error("Quick toggle failed:", err);
        }
    };

    // 3. Handle Save (Add or Update)
    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = editingTask 
            ? 'http://localhost/mentorlog-api/update-task.php' 
            : 'http://localhost/mentorlog-api/create-task.php';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    id: editingTask?.id 
                })
            });

            if (response.ok) {
                const refresh = await fetch('http://localhost/mentorlog-api/get-tasks.php');
                const newData = await refresh.json();
                setTasks(newData);
                closeModal();
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Error saving task to database.");
        }
    };

    // 4. Handle Delete
    const handleDelete = async (id: number) => {
        if (!window.confirm("Permanently delete this task?")) return;

        try {
            const response = await fetch(`http://localhost/mentorlog-api/delete-task.php?id=${id}`, { 
                method: 'DELETE' 
            });
            
            const result = await response.json();

            if (result.success) {
                setTasks(prev => prev.filter(t => t.id !== id));
            } else {
                alert("Error: " + result.error);
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const openModal = (task?: Task) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                user_id: task.user_id.toString(),
                title: task.title,
                task_description: task.task_description,
                due_date: task.due_date,
                status: task.status
            });
        } else {
            setEditingTask(null);
            setFormData({ user_id: '', title: '', task_description: '', due_date: '', status: 'Pending' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'In-Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Synchronizing Database...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic">Manage <span className="text-blue-500">Tasks</span></h1>
                    <p className="text-slate-400 mt-2 font-medium">Assign goals to students from the database.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                        + Assign New Task
                    </button>
                    <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/60 backdrop-blur-xl">
                        {['All', 'Pending', 'In-Progress', 'Completed'].map((s) => (
                            <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filter === s ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>{s}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800/60 bg-slate-800/10">
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Student</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Task Details</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {tasks.filter(t => filter === 'All' || t.status === filter).map((task) => (
                                <tr key={task.id} className="hover:bg-blue-500/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700 font-bold text-blue-400">
                                                {task.student_name?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-100">{task.student_name || 'Unassigned'}</p>
                                                <p className="text-[10px] font-mono text-slate-500">ID: {task.user_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 max-w-xs">
                                        <p className="text-sm font-bold text-slate-200">{task.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">"{task.task_description}"</p>
                                        <p className="text-[9px] mt-2 font-bold text-slate-600 uppercase tracking-widest">Due: {task.due_date}</p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button 
                                            onClick={() => toggleStatus(task)}
                                            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-90 hover:brightness-110 ${getStatusStyle(task.status)}`}
                                        >
                                            {task.status}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openModal(task)} className="p-2 text-slate-500 hover:text-blue-400 bg-slate-800/50 rounded-lg border border-slate-700/50 transition-colors">Edit</button>
                                            <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-500 hover:text-red-400 bg-slate-800/50 rounded-lg border border-slate-700/50 transition-colors">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-6">
                    <div className="bg-[#1e293b] border border-slate-700/50 w-full max-w-xl rounded-[2.5rem] p-10 shadow-3xl">
                        <h2 className="text-3xl font-black text-white tracking-tight italic mb-8">
                            {editingTask ? 'Update' : 'New'} <span className="text-blue-500">Task</span>
                        </h2>
                        <form onSubmit={handleSaveTask} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest ml-1">Assign To</label>
                                    <select 
                                        required
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                        value={formData.user_id}
                                        onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                    >
                                        <option value="">Select a Student</option>
                                        {students.length > 0 ? (
                                            students.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.full_name || `User #${s.id}`} 
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No students found</option>
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest ml-1">Deadline</label>
                                    <input 
                                        type="date" required
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest ml-1">Task Title</label>
                                <input 
                                    required placeholder="e.g. Design Dashboard"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest ml-1">Details</label>
                                <textarea 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm h-32 outline-none focus:border-blue-500 resize-none"
                                    value={formData.task_description}
                                    onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 px-8 py-4 rounded-2xl text-slate-500 font-black text-sm hover:bg-slate-800 transition-colors">Discard</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl text-white font-black text-sm transition-all shadow-xl shadow-blue-600/30">Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTasks;