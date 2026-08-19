import React, { useState, useEffect } from 'react';
import api from '../../services/api';

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

    const fetchDatabaseData = async () => {
        setLoading(true);
        try {
            const [studentRes, taskRes] = await Promise.all([
                api.get('/admin/students'),
                api.get('/tasks/all')
            ]);

            const studentList = studentRes.data?.data || studentRes.data || [];
            const taskList = taskRes.data?.data || taskRes.data || [];
            setStudents(studentList);
            setTasks(taskList);
        } catch (err) {
            console.error("Database connection failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatabaseData();
    }, []);

    const toggleStatus = async (task: Task) => {
        const statusOrder: Task['status'][] = ['Pending', 'In-Progress', 'Completed'];
        const nextStatus = statusOrder[(statusOrder.indexOf(task.status) + 1) % statusOrder.length];

        try {
            await api.put(`/tasks/${task.id}/status`, { status: nextStatus });
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
        } catch (err) { console.error(err); }
    };

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEditing = !!editingTask;

        try {
            if (isEditing && editingTask) {
                await api.put(`/tasks/${editingTask.id}`, {
                    user_id: parseInt(formData.user_id), 
                    title: formData.title,
                    task_description: formData.task_description,
                    due_date: formData.due_date,
                    status: formData.status
                });
            } else {
                await api.post('/tasks/assign', {
                    student_id: parseInt(formData.user_id), 
                    title: formData.title,
                    task_description: formData.task_description,
                    due_date: formData.due_date
                });
            }
            await fetchDatabaseData();
            closeModal();
        } catch (err) { alert("Action failed."); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this task record?")) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) { console.error(err); }
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
            case 'Completed': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
            case 'In-Progress': return 'text-blue-400 border-blue-400/20 bg-blue-400/5';
            default: return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Project Control</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Goal <span className="text-slate-500">Manager</span></h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                        {['All', 'Pending', 'In-Progress', 'Completed'].map((s) => (
                            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${filter === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>{s}</button>
                        ))}
                    </div>
                    <button onClick={() => openModal()} className="bg-white text-black px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                        + Assign Task
                    </button>
                </div>
            </div>

            {/* Task Ledger */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Syncing Task Database...</div>
                ) : tasks.filter(t => filter === 'All' || t.status === filter).map((task) => (
                    <div key={task.id} className="bg-[#1e293b] rounded-xl border border-slate-800/50 overflow-hidden hover:border-slate-600 transition-all group shadow-sm">
                        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                            
                            {/* Student Info Col */}
                            <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/30 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-blue-500">
                                    {task.student_name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Assigned To</span>
                                    <span className="text-xs font-bold text-white uppercase tracking-tight">{task.student_name || 'System User'}</span>
                                    <span className="text-[9px] font-mono text-slate-600 block mt-0.5">ID_REF: {task.user_id}</span>
                                </div>
                            </div>

                            {/* Task Content Col */}
                            <div className="lg:col-span-6 p-6 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-white font-black text-sm uppercase tracking-wider">{task.title}</h3>
                                    <span className="text-[9px] text-slate-600 font-mono tracking-tighter">#{task.id.toString().padStart(4, '0')}</span>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed font-medium bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 italic">
                                    {task.task_description}
                                </p>
                                <div className="flex items-center gap-4 pt-1">
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Deadline:</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(task.due_date).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Actions Col */}
                            <div className="lg:col-span-3 p-6 bg-slate-900/20 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-center gap-2">
                                <button 
                                    onClick={() => toggleStatus(task)}
                                    className={`w-full py-2 rounded text-[9px] font-black uppercase tracking-[0.2em] border transition-all hover:brightness-125 ${getStatusStyle(task.status)}`}
                                >
                                    {task.status}
                                </button>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button onClick={() => openModal(task)} className="py-2 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">Edit</button>
                                    <button onClick={() => handleDelete(task.id)} className="py-2 rounded bg-slate-800 border border-slate-700 text-red-500/70 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Delete</button>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/95 backdrop-blur-sm p-4">
                    <div className="bg-[#1e293b] border border-slate-800 w-full max-w-lg rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-6">
                            {editingTask ? 'Edit' : 'Assign'} <span className="text-blue-500">Goal</span>
                        </h2>
                        <form onSubmit={handleSaveTask} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Assignee</label>
                                    <select 
                                        required className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-blue-500 appearance-none"
                                        value={formData.user_id}
                                        onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Due Date</label>
                                    <input 
                                        type="date" required className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-blue-500"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Task Title</label>
                                <input 
                                    required className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-blue-500"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Description</label>
                                <textarea 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white text-xs h-24 outline-none focus:border-blue-500 resize-none"
                                    value={formData.task_description}
                                    onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 rounded-lg text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 px-6 py-3 rounded-lg text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">Execute</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTasks;