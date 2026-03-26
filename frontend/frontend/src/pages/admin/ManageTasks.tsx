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
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState({
        user_id: '',
        title: '',
        task_description: '',
        due_date: '',
        status: 'Pending' as Task['status']
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Simulating API Latency
                await new Promise(resolve => setTimeout(resolve, 800));
                
                const mockStudents: User[] = [
                    { id: 101, full_name: 'Eric Dominic Momo', role: 'student' },
                    { id: 102, full_name: 'Jane Smith', role: 'student' },
                ];
                setStudents(mockStudents);

                setTasks([
                    { id: 1, user_id: 101, student_name: 'Eric Dominic Momo', title: 'Database Schema', task_description: 'Design ERD for MentorLog', status: 'Completed', due_date: '2026-03-20' },
                    { id: 2, user_id: 102, student_name: 'Jane Smith', title: 'API Integration', task_description: 'Set up Node.js endpoints', status: 'In-Progress', due_date: '2026-03-25' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveTask = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedStudent = students.find(s => s.id === parseInt(formData.user_id));
        
        if (editingTask) {
            setTasks(prev => prev.map(t => t.id === editingTask.id ? { 
                ...t, 
                title: formData.title,
                task_description: formData.task_description,
                due_date: formData.due_date,
                status: formData.status,
                user_id: parseInt(formData.user_id),
                student_name: selectedStudent?.full_name 
            } : t));
        } else {
            const newTask: Task = {
                id: Date.now(),
                user_id: parseInt(formData.user_id),
                student_name: selectedStudent?.full_name,
                title: formData.title,
                task_description: formData.task_description,
                status: formData.status,
                due_date: formData.due_date
            };
            setTasks(prev => [newTask, ...prev]);
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            setTasks(prev => prev.filter(t => t.id !== id));
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
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
            case 'In-Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
            default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Fetching Tasks...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic">Manage <span className="text-blue-500">Tasks</span></h1>
                    <p className="text-slate-400 mt-2 font-medium">Assign new goals and monitor real-time student performance.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <button 
                        onClick={() => openModal()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                    >
                        <span>+</span> Assign New Task
                    </button>
                    
                    <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/60 backdrop-blur-xl">
                        {['All', 'Pending', 'In-Progress', 'Completed'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                    filter === s ? 'bg-slate-800 text-blue-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-3xl">
                <div className="overflow-x-auto font-sans">
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
                                <tr key={task.id} className="hover:bg-blue-500/2 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700 font-bold text-blue-400">
                                                {task.student_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-100">{task.student_name}</p>
                                                <p className="text-[10px] font-mono text-slate-500 uppercase">ID: {task.user_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 max-w-xs">
                                        <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{task.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic font-medium">"{task.task_description}"</p>
                                        <p className="text-[9px] mt-2 font-bold text-slate-600 uppercase tracking-widest">Due: {task.due_date}</p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openModal(task)} className="p-2 text-slate-500 hover:text-blue-400 transition-colors bg-slate-800/50 rounded-lg hover:bg-blue-500/10 border border-slate-700/50">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-800/50 rounded-lg hover:bg-red-500/10 border border-slate-700/50">
                                                Delete
                                            </button>
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
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-6">
                    <div className="bg-[#1e293b] border border-slate-700/50 w-full max-w-xl rounded-[2.5rem] p-10 shadow-3xl animate-in zoom-in-95 duration-200">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tight italic">
                                {editingTask ? 'Update' : 'New'} <span className="text-blue-500">Task</span>
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Fill in the details for the student assignment.</p>
                        </div>

                        <form onSubmit={handleSaveTask} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest ml-1">Assign To</label>
                                    <select 
                                        required
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none"
                                        value={formData.user_id}
                                        onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                    >
                                        <option value="">Choose Student</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest ml-1">Deadline</label>
                                    <input 
                                        type="date"
                                        required
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500 transition-all"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest ml-1">Task Name</label>
                                <input 
                                    required
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:border-blue-500 outline-none transition-all"
                                    placeholder="Enter concise title..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest ml-1">Detailed Description</label>
                                <textarea 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm h-32 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Outline the deliverables..."
                                    value={formData.task_description}
                                    onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                                />
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-6">
                                <button type="button" onClick={closeModal} className="flex-1 px-8 py-4 rounded-2xl text-slate-500 font-black text-sm hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
                                    Discard
                                </button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl text-white font-black text-sm transition-all shadow-xl shadow-blue-600/30">
                                    Confirm Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTasks;