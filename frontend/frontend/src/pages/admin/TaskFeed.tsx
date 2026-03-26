import React from 'react';

// Simplified interface to match your new lightweight design
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
        <div className="flex flex-col h-full">
            {/* Header matches the sidebar's minimalist typography */}
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-4 px-2">
                Recent Task Reports
            </h3>
            
            {/* Scrollable area for tasks */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div 
                            key={task.id} 
                            className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-blue-500/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-slate-200 truncate pr-2">
                                    {task.title}
                                </p>
                                <span className={`shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                    task.status === 'Completed' 
                                        ? 'bg-emerald-500/20 text-emerald-400' 
                                        : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                    {task.status}
                                </span>
                            </div>
                            
                            <p className="text-[10px] text-slate-500 font-medium leading-none">
                                Assigned to: <span className="text-blue-400/80">{task.student_name || 'Unassigned'}</span>
                            </p>
                        </div>
                    ))
                ) : (
                    /* Empty State */
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-800/50 rounded-2xl">
                        <p className="text-[10px] text-slate-600 font-bold italic text-center px-4">
                            No recent activity
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskFeed;