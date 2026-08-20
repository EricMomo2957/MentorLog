import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logoPhoto from '../../assets/mentorlogOption.png'; 
import { 
    LayoutDashboard, CheckSquare, Users, FileText, CalendarCheck, 
    Megaphone, Inbox, HelpCircle, MessageSquare, Key, BarChart3, 
    Calendar, ShieldAlert, Code2, User, Settings, LogOut, Search, Bell
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false); 
    const userName = localStorage.getItem('userName') || 'Vitalji';

    const confirmLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navGroups: NavGroup[] = [
        {
            title: "CORE",
            items: [
                { path: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { path: '/manage-tasks', label: 'OJT Tasks', icon: CheckSquare },
                { path: '/manage-students', label: 'Manage Interns', icon: Users },
            ]
        },
        {
            title: "MANAGEMENT",
            items: [
                { path: '/admin/manage-submissions', label: 'Submissions', icon: FileText },
                { path: '/manage-attendance', label: 'Attendance Logs', icon: CalendarCheck },
                { path: '/manage-announcements', label: 'Announcements', icon: Megaphone },
                { path: '/manage-requests', label: 'Service Requests', icon: Inbox },
            ]
        },
        {
            title: "COMMUNICATION",
            items: [
                { path: '/admin/ask-question', label: 'Question Inbox', icon: HelpCircle },
                { path: '/manage-feedback', label: 'Student Feedback', icon: MessageSquare },
                { path: '/manage-forgot-password', label: 'Password Resets', icon: Key },
            ]
        },
        {
            title: "ANALYTICS & AUDIT",
            items: [
                { path: '/admin/reports', label: 'Report Analytics', icon: BarChart3 },
                { path: '/admin-calendar', label: 'Admin Calendar', icon: Calendar },
                { path: '/manage-audit-logs', label: 'System Audit Logs', icon: ShieldAlert },
                { path: '/admin/manage-codes', label: 'Reference Codes', icon: Code2 },
            ]
        }
    ];

    // Find current page title for breadcrumbs
    const currentPath = location.pathname;
    let currentPageLabel = 'Dashboard';
    navGroups.forEach(g => {
        g.items.forEach(item => {
            if (item.path === currentPath) currentPageLabel = item.label;
        });
    });
    if (currentPath === '/admin-profile') currentPageLabel = 'My Profile';
    if (currentPath === '/admin-settings') currentPageLabel = 'Settings';

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-500/20">
            
            {/* --- SIDEBAR (Dark Navy Automoor Theme) --- */}
            <aside className="w-64 bg-[#0b1329] text-slate-300 flex flex-col sticky top-0 h-screen z-50 shrink-0 border-r border-slate-800 shadow-xl">
                
                {/* Brand Header */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0">
                        <img src={logoPhoto} alt="Logo" className="w-6 h-6 object-contain rounded" />
                    </div>
                    <div>
                        <h2 className="text-base font-black tracking-tight text-white leading-none">MentorLog</h2>
                        <span className="text-[10px] text-slate-400 font-medium">Enterprise Suite</span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {navGroups.map((group) => (
                        <div key={group.title} className="space-y-1">
                            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                {group.title}
                            </h3>
                            {group.items.map((link) => {
                                const isActive = location.pathname === link.path;
                                const IconComponent = link.icon;
                                return (
                                    <Link 
                                        key={link.path}
                                        to={link.path} 
                                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                                            isActive 
                                            ? 'text-white bg-[#1e293b] font-semibold shadow-inner' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <IconComponent className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Bottom Options (Settings & Logout) */}
                <div className="p-4 border-t border-slate-800/80 space-y-1 shrink-0">
                    <Link
                        to="/admin-settings"
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            location.pathname === '/admin-settings'
                            ? 'text-white bg-[#1e293b]'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                    >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                    </Link>
                    
                    <button 
                        onClick={() => setShowLogoutModal(true)} 
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
                    >
                        <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* TOP NAVIGATION BAR */}
                <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-3.5 flex items-center justify-between shadow-xs">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Link to="/admin-dashboard" className="hover:text-blue-600 transition-colors">
                            <LayoutDashboard className="w-3.5 h-3.5" />
                        </Link>
                        <span>/</span>
                        <span className="font-semibold text-slate-800">{currentPageLabel}</span>
                    </div>

                    {/* Right Toolbar */}
                    <div className="flex items-center gap-5">
                        {/* Quick Search Input */}
                        <div className="relative hidden sm:block">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search..."
                                className="bg-slate-100/80 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition-all w-48"
                            />
                        </div>

                        {/* Notification Bell */}
                        <button className="relative text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-all">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        {/* User Profile Pill */}
                        <Link to="/admin-profile" className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs shadow-xs">
                                {userName.charAt(0)}
                            </div>
                            <span className="text-xs font-semibold text-slate-700 hidden md:inline">{userName}</span>
                        </Link>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 bg-[#f8fafc] p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* --- LOGOUT MODAL --- */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                            <img src={logoPhoto} className="w-8 h-8 object-contain" alt="MentorLog" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-800 mb-1">End Session?</h3>
                        <p className="text-slate-500 text-xs mb-6">
                            Are you sure you want to log out of <span className="font-semibold text-slate-700">MentorLog Admin</span>?
                        </p>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowLogoutModal(false)}
                                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-xs transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmLogout}
                                className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-blue-600/20"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;