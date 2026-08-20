import React from 'react';

interface Task {
    id: number;
    student_name?: string;
    title: string;
    status: string;
}

interface TaskFeedProps {
    tasks: Task[];
}

const TaskFeed: React.FC<TaskFeedProps> = ({ tasks }) => {
    return (
        <div className="flex flex-col h-full space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Task Feed
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div 
                            key={task.id} 
                            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-1.5">
                                <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate pr-2">
                                    {task.title}
                                </p>
                                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                    task.status === 'Completed' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                    {task.status}
                                </span>
                            </div>
                            
                            <p className="text-[11px] text-slate-400">
                                Assigned to <span className="font-bold text-slate-300">{task.student_name || 'Unassigned'}</span>
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                        <p className="text-xs text-slate-500 italic">
                            No recent activity found.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskFeed;