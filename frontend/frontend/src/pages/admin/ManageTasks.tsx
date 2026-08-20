import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Plus, Search, Download, Filter, Edit2, Trash2, 
    CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight, X
} from 'lucide-react';

interface User {
    id: number;
    full_name: string;
    email?: string;
    profile_pic?: string;
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
    profile_pic?: string;
}

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

const pastelAvatarStyles = [
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
];

const getAvatarStyle = (id: number) => pastelAvatarStyles[id % pastelAvatarStyles.length];

const getInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const ManageTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [filter, setFilter] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
    
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
        const targetUserId = formData.user_id ? parseInt(formData.user_id, 10) : undefined;

        try {
            if (isEditing && editingTask) {
                await api.put(`/tasks/${editingTask.id}`, {
                    user_id: targetUserId, 
                    title: formData.title,
                    task_description: formData.task_description,
                    due_date: formData.due_date,
                    status: formData.status
                });
            } else {
                await api.post('/tasks/assign', {
                    student_id: targetUserId, 
                    title: formData.title,
                    task_description: formData.task_description,
                    due_date: formData.due_date
                });
            }
            await fetchDatabaseData();
            closeModal();
        } catch (err: any) {
            console.error("Task save error:", err);
            alert(err.response?.data?.message || "Action failed.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this task directive record?")) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) { console.error(err); }
    };

    const openModal = (task?: Task) => {
        if (task) {
            setEditingTask(task);
            let formattedDueDate = '';
            if (task.due_date) {
                const d = new Date(task.due_date);
                if (!isNaN(d.getTime())) {
                    formattedDueDate = d.toISOString().split('T')[0];
                }
            }
            setFormData({
                user_id: task.user_id ? task.user_id.toString() : '',
                title: task.title || '',
                task_description: task.task_description || '',
                due_date: formattedDueDate,
                status: task.status || 'Pending'
            });
        } else {
            setEditingTask(null);
            setFormData({ user_id: '', title: '', task_description: '', due_date: '', status: 'Pending' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed': 
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
            case 'In-Progress': 
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full"><Clock className="w-3 h-3" /> In-Progress</span>;
            default: 
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full"><AlertCircle className="w-3 h-3" /> Pending</span>;
        }
    };

    const filteredTasks = tasks.filter(t => {
        const matchesFilter = filter === 'All' || t.status === filter;
        const matchesSearch = searchQuery === '' || 
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.student_name && t.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (t.task_description && t.task_description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const toggleSelectAll = () => {
        if (selectedTasks.length === filteredTasks.length) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(filteredTasks.map(t => t.id));
        }
    };

    const toggleSelectTask = (id: number) => {
        if (selectedTasks.includes(id)) {
            setSelectedTasks(prev => prev.filter(item => item !== id));
        } else {
            setSelectedTasks(prev => [...prev, id]);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">OJT Task Directives</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage, assign, and track intern project tasks</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => openModal()} 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all flex items-center gap-2 active:scale-98"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Task</span>
                    </button>

                    <button 
                        onClick={() => alert("Exporting task ledger...")} 
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2.5 rounded-lg shadow-xs transition-all"
                        title="Export Tasks"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filter & Control Bar (Automoor Style) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                
                {/* Left Filter Pill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="All">Filter Status: All</option>
                            <option value="Pending">Pending</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5">
                        <span>Created Date</span>
                        <span className="text-slate-400">▾</span>
                    </button>

                    <button className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5">
                        <span>Advanced Filters</span>
                        <Filter className="w-3 h-3 text-slate-400" />
                    </button>
                </div>

                {/* Right Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search tasks or interns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* SaaS Table Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-slate-400 text-xs font-medium animate-pulse">
                        Loading task directives...
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs font-medium">
                        No task directives found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input 
                                            type="checkbox"
                                            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="py-3 px-4">Intern Assigned ↕</th>
                                    <th className="py-3 px-4">Task Details ↕</th>
                                    <th className="py-3 px-4">Due Date ↕</th>
                                    <th className="py-3 px-4">Status ↕</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {filteredTasks.map((task) => {
                                    const avatarStyle = getAvatarStyle(task.user_id || task.id);
                                    const initials = getInitials(task.student_name);
                                    const isChecked = selectedTasks.includes(task.id);

                                    return (
                                        <tr key={task.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>
                                            <td className="py-3.5 px-4 text-center">
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelectTask(task.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            
                                            {/* Student Column with Photo or Pastel Initial Avatar */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    {task.profile_pic ? (
                                                        <img 
                                                            src={getFullPicUrl(task.profile_pic)} 
                                                            alt={task.student_name} 
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                        />
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-tight">{task.student_name || 'System Student'}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">ID: #{task.user_id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Task Details */}
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <p className="font-semibold text-slate-900 leading-snug">{task.title}</p>
                                                <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{task.task_description}</p>
                                            </td>

                                            {/* Due Date */}
                                            <td className="py-3.5 px-4 font-mono text-slate-600">
                                                {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Due Date'}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <button onClick={() => toggleStatus(task)} title="Click to toggle status">
                                                    {getStatusBadge(task.status)}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => openModal(task)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-all"
                                                        title="Edit Task"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(task.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Table Footer Pagination */}
                <div className="bg-slate-50/50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <span>Displaying</span>
                        <select className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 outline-none">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                        <span>out of {filteredTasks.length} tasks</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button className="p-1 rounded border border-slate-200 hover:bg-white disabled:opacity-50" disabled>
                            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-xs">1</button>
                        <button className="p-1 rounded border border-slate-200 hover:bg-white disabled:opacity-50" disabled>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Clean White Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingTask ? 'Edit Task Directive' : 'Assign New Task'}
                            </h2>
                            <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTask} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Assignee</label>
                                    <select 
                                        required 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs outline-none focus:border-blue-500 focus:bg-white"
                                        value={formData.user_id}
                                        onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Due Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs outline-none focus:border-blue-500 focus:bg-white"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Task Title</label>
                                <input 
                                    required 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs outline-none focus:border-blue-500 focus:bg-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="e.g. Update API Integration"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">Description</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs h-24 outline-none focus:border-blue-500 focus:bg-white resize-none"
                                    value={formData.task_description}
                                    onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                                    placeholder="Enter instructions..."
                                />
                            </div>

                            {editingTask && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600">Task Status</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs outline-none focus:border-blue-500 focus:bg-white"
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value as Task['status']})}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In-Progress">In-Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold text-xs hover:bg-blue-700 transition-all shadow-xs"
                                >
                                    Save Task
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