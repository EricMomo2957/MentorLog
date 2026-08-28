import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logoPhoto from '../../assets/mentorlogOption.png'; 
import api from '../../services/api';
import { NotificationDropdown } from '../../components/NotificationDropdown';
import { 
    LayoutDashboard, CheckSquare, Users, FileText, CalendarCheck, 
    Megaphone, Inbox, HelpCircle, MessageSquare, Key, 
    Calendar, ShieldAlert, Code2, Settings, LogOut, Search,
    ChevronLeft, ChevronRight, Award
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

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false); 
    const [userName, setUserName] = useState<string>(localStorage.getItem('userName') || 'Vitalji');
    const [userPic, setUserPic] = useState<string | undefined>(undefined);

    const fetchAdminProfile = useCallback(async () => {
        try {
            const res = await api.get('/auth/profile');
            const userData = res.data?.user || res.data;
            if (userData) {
                if (userData.full_name) {
                    setUserName(userData.full_name);
                    localStorage.setItem('userName', userData.full_name);
                }
                if (userData.profile_pic) {
                    setUserPic(userData.profile_pic);
                }
            }
        } catch (err) {
            console.error("Admin Profile Fetch Error:", err);
        }
    }, []);

    useEffect(() => {
        fetchAdminProfile();

        const handleProfileUpdate = () => {
            fetchAdminProfile();
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, [fetchAdminProfile]);

    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        return localStorage.getItem('mentorlog_admin_sidenav_collapsed') === 'true';
    });

    const toggleSidebar = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('mentorlog_admin_sidenav_collapsed', String(next));
            return next;
        });
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        localStorage.removeItem('id');
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
                { path: '/manage-evaluations', label: 'Intern Evaluations', icon: Award },
                { path: '/manage-requests', label: 'Service Requests', icon: Inbox },
            ]
        },
        {
            title: "COMMUNICATION",
            items: [
                { path: '/manage-feedback', label: 'Student Feedback', icon: MessageSquare },
                { path: '/manage-forgot-password', label: 'Password Resets', icon: Key },
            ]
        },
        {
            title: "AUDIT & UTILITIES",
            items: [
                { path: '/manage-audit-logs', label: 'System Audit Logs', icon: ShieldAlert },
                { path: '/admin/manage-codes', label: 'Reference Codes', icon: Code2 },
            ]
        }
    ];

    const currentPath = location.pathname;
    let currentPageLabel = 'Dashboard';
    
    const allNavItems = [
        ...navGroups.flatMap(g => g.items),
        { path: '/manage-announcements', label: 'Announcements', icon: Megaphone },
        { path: '/admin/ask-question', label: 'Question Inbox', icon: HelpCircle },
        { path: '/admin-calendar', label: 'Admin Calendar', icon: Calendar },
        { path: '/admin-settings', label: 'Settings', icon: Settings },
        { path: '/admin-profile', label: 'My Profile', icon: Settings }
    ];

    allNavItems.forEach(item => {
        if (item.path === currentPath) currentPageLabel = item.label;
    });

    const picUrl = userPic ? getFullPicUrl(userPic) : null;

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-500/20">
            
            {/* --- SIDEBAR (Dark Navy Automoor Theme) --- */}
            <aside className={`bg-[#0b1329] text-slate-300 flex flex-col sticky top-0 h-screen z-50 shrink-0 border-r border-slate-800 shadow-xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                
                {/* Brand Header */}
                <div className={`flex items-center justify-between border-b border-slate-800/60 ${isCollapsed ? 'p-3 justify-center' : 'p-5'}`}>
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0">
                                <img src={logoPhoto} alt="Logo" className="w-6 h-6 object-contain rounded" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-black tracking-tight text-white leading-none truncate">MentorLog</h2>
                                <span className="text-[10px] text-slate-400 font-medium truncate block">Enterprise Suite</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0" title="MentorLog Enterprise">
                            <img src={logoPhoto} alt="Logo" className="w-6 h-6 object-contain rounded" />
                        </div>
                    )}

                    {/* Toggle Bar Button */}
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shadow-xs shrink-0"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Sidenav Admin Profile Card */}
                {!isCollapsed ? (
                    <div className="mx-4 my-4 p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-3">
                        <Link to="/admin-profile" className="shrink-0 hover:opacity-80 transition-opacity">
                            {picUrl ? (
                                <img 
                                    src={picUrl} 
                                    alt={userName} 
                                    className="w-10 h-10 rounded-full object-cover border border-amber-400/40 shadow-xs" 
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center border border-amber-400/30">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </Link>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate leading-tight">{userName}</p>
                            <p className="text-[10px] text-amber-400 truncate font-semibold">Administrator</p>
                        </div>
                    </div>
                ) : (
                    <div className="mx-2 my-4 flex justify-center">
                        <Link to="/admin-profile" title={`${userName} (Administrator)`} className="hover:opacity-80 transition-opacity">
                            {picUrl ? (
                                <img 
                                    src={picUrl} 
                                    alt={userName} 
                                    className="w-10 h-10 rounded-full object-cover border border-amber-400/40 shadow-xs" 
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center border border-amber-400/30">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </Link>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {navGroups.map((group) => (
                        <div key={group.title} className="space-y-1">
                            {!isCollapsed ? (
                                <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    {group.title}
                                </h3>
                            ) : (
                                <div className="h-px bg-slate-800/60 my-2 mx-1" />
                            )}
                            {group.items.map((link) => {
                                const isActive = location.pathname === link.path;
                                const IconComponent = link.icon;
                                return (
                                    <Link 
                                        key={link.path}
                                        to={link.path} 
                                        title={isCollapsed ? link.label : undefined}
                                        className={`flex items-center gap-3 ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'} rounded-xl text-xs font-medium transition-all group ${
                                            isActive 
                                            ? 'text-white bg-[#1e293b] font-semibold shadow-inner' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <IconComponent className={`w-4 h-4 transition-colors shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                                        {!isCollapsed && <span>{link.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Bottom Options (Announcements, Question Inbox, Admin Calendar, Settings & Logout) */}
                <div className="p-3 border-t border-slate-800/80 space-y-1 shrink-0">
                    <Link
                        to="/manage-announcements"
                        title={isCollapsed ? "Announcements" : undefined}
                        className={`flex items-center gap-3 ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2'} rounded-xl text-xs font-medium transition-all ${
                            location.pathname === '/manage-announcements'
                            ? 'text-white bg-[#1e293b] font-semibold shadow-inner'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                    >
                        <Megaphone className={`w-4 h-4 shrink-0 ${location.pathname === '/manage-announcements' ? 'text-blue-400' : 'text-slate-400'}`} />
                        {!isCollapsed && <span>Announcements</span>}
                    </Link>

                    <Link
                        to="/admin/ask-question"
                        title={isCollapsed ? "Question Inbox" : undefined}
                        className={`flex items-center gap-3 ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2'} rounded-xl text-xs font-medium transition-all ${
                            location.pathname === '/admin/ask-question'
                            ? 'text-white bg-[#1e293b] font-semibold shadow-inner'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                    >
                        <HelpCircle className={`w-4 h-4 shrink-0 ${location.pathname === '/admin/ask-question' ? 'text-blue-400' : 'text-slate-400'}`} />
                        {!isCollapsed && <span>Question Inbox</span>}
                    </Link>

                    <Link
                        to="/admin-calendar"
                        title={isCollapsed ? "Admin Calendar" : undefined}
                        className={`flex items-center gap-3 ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2'} rounded-xl text-xs font-medium transition-all ${
                            location.pathname === '/admin-calendar'
                            ? 'text-white bg-[#1e293b] font-semibold shadow-inner'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                    >
                        <Calendar className={`w-4 h-4 shrink-0 ${location.pathname === '/admin-calendar' ? 'text-blue-400' : 'text-slate-400'}`} />
                        {!isCollapsed && <span>Admin Calendar</span>}
                    </Link>

                    <div className="pt-2 border-t border-slate-800/60 space-y-1">
                        <Link
                            to="/admin-settings"
                            title={isCollapsed ? "Settings" : undefined}
                            className={`flex items-center gap-3 ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2'} rounded-xl text-xs font-medium transition-all ${
                                location.pathname === '/admin-settings'
                                ? 'text-white bg-[#1e293b] font-semibold shadow-inner'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <Settings className={`w-4 h-4 shrink-0 ${location.pathname === '/admin-settings' ? 'text-blue-400' : 'text-slate-400'}`} />
                            {!isCollapsed && <span>Settings</span>}
                        </Link>
                        
                        <button 
                            onClick={() => setShowLogoutModal(true)} 
                            title={isCollapsed ? "Logout" : undefined}
                            className={`w-full flex items-center gap-3 ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2'} rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group cursor-pointer`}
                        >
                            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 shrink-0" />
                            {!isCollapsed && <span>Logout</span>}
                        </button>
                    </div>
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

                        {/* Notification Bell Dropdown */}
                        <NotificationDropdown />

                        {/* User Profile Pill with Live Photo */}
                        <Link to="/admin-profile" className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity">
                            {picUrl ? (
                                <img 
                                    src={picUrl} 
                                    alt={userName} 
                                    className="w-8 h-8 rounded-full object-cover border border-amber-300 shadow-xs" 
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs shadow-xs">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-xs font-semibold text-slate-700 hidden md:inline">{userName}</span>
                        </Link>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 bg-white p-6 lg:p-8">
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