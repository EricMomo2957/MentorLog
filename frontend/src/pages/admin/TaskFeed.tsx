import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle, CheckSquare } from 'lucide-react';

interface Task {
    id: number;
    user_id?: number;
    student_name?: string;
    profile_pic?: string;
    title: string;
    task_description?: string;
    status: string;
    due_date?: string;
}

interface TaskFeedProps {
    tasks: Task[];
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
];
const getAvatarStyle = (id: number) => pastelAvatarStyles[id % pastelAvatarStyles.length];

const getInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    const cleanDate = dateStr.split('T')[0];
    const d = new Date(cleanDate + 'T00:00:00');
    if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }
    return cleanDate;
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Completed':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
            );
        case 'In-Progress':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                    <Clock className="w-3 h-3" /> In-Progress
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                    <AlertCircle className="w-3 h-3" /> Pending
                </span>
            );
    }
};

const TaskFeed: React.FC<TaskFeedProps> = ({ tasks }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.student_name && t.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.task_description && t.task_description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-4">
            {/* Table Control Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Assigned Tasks Log ({filteredTasks.length})
                    </span>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search by title or intern..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* SaaS Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-3 px-4">Assignee (Intern) ↕</th>
                            <th className="py-3 px-4">Task Title ↕</th>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4">Due Date ↕</th>
                            <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                const avatarStyle = getAvatarStyle(task.id || 0);
                                const initials = getInitials(task.student_name);

                                return (
                                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Assignee Intern Info */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                {task.profile_pic ? (
                                                    <img 
                                                        src={getFullPicUrl(task.profile_pic)} 
                                                        alt={task.student_name || 'OJT Intern'} 
                                                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" 
                                                    />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                                                        {initials}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-tight">{task.student_name || 'Unassigned Intern'}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">Task ID: #{task.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Task Title */}
                                        <td className="py-3.5 px-4 font-bold text-slate-900">
                                            {task.title}
                                        </td>

                                        {/* Description */}
                                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                                            {task.task_description || 'No description provided.'}
                                        </td>

                                        {/* Due Date */}
                                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                                            {formatDate(task.due_date)}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="py-3.5 px-4 text-right">
                                            {getStatusBadge(task.status)}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs italic">
                                    No task activity records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskFeed;