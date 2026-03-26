import React from 'react';

interface Task {
    id: number;
    user_id: number; // Matches your DB 'user_id' int(11)
    student_name?: string; // Optional: Usually joined from the 'users' table in your API
    title: string;
    task_description: string;
    status: 'Pending' | 'In-Progress' | 'Completed'; // Matches your DB Enum
    due_date: string;
}

interface TaskFeedProps {
    tasks: Task[];
}

const TaskFeed: React.FC<TaskFeedProps> = ({ tasks }) => {
    return (
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-700 bg-slate-800/30">
                <h3 className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                    Recent Task Reports
                </h3>
            </div>
            
            <div className="overflow-y-auto p-5 space-y-4 max-h-125 scrollbar-thin scrollbar-thumb-slate-700">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div 
                            key={task.id} 
                            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-tighter text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                                    {/* Falls back to ID if name isn't joined in the query */}
                                    {task.student_name || `Student ID: ${task.user_id}`}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Date'}
                                </span>
                            </div>
                            
                            <h4 className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors">
                                {task.title}
                            </h4>
                            
                            <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-2">
                                {task.task_description}
                            </p>
                            
                            <div className="mt-3 flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    task.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                    task.status === 'In-Progress' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                                    'bg-slate-500' // For 'Pending'
                                }`} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {task.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-500 text-xs font-medium italic">
                        No tasks reported yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskFeed;