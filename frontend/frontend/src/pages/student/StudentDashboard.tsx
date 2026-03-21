import StudentLayout from './StudentLayout';

const StudentDashboard = () => {
    return (
        <StudentLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Student Portal
                    </h1>
                    <p className="text-slate-400 mt-1">Real-time overview of your OJT progress.</p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#1e293b] p-6 rounded-2xl border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Total Hours</p>
                        <h3 className="text-4xl font-bold mt-2">120 / 600</h3>
                        <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full w-[20%] transition-all duration-500"></div>
                        </div>
                    </div>

                    <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                        <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Status</p>
                        <h3 className="text-3xl font-bold mt-2 text-white">Clocked In</h3>
                        <p className="text-slate-400 text-xs mt-2 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Started at 8:00 AM
                        </p>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;