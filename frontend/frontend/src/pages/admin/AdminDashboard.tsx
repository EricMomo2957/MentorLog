import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
    return (
        <AdminLayout>
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Admin Statistics
                </h1>
                <p className="text-slate-400 mt-2">Real-time overview of MentorLog activity.</p>
            </div>

            {/* Statistics Card */}
            <div className="bg-[#1e293b] p-10 rounded-2xl border border-slate-700 shadow-xl transition-all hover:border-blue-500/30">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        👥
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Current Attendance</p>
                        <h3 className="text-2xl font-bold text-white">
                            5 students currently clocked in
                        </h3>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;