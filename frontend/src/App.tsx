import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageAttendance = lazy(() => import('./pages/admin/ManageAttendance'));
const ManageStudents = lazy(() => import('./pages/admin/ManageStudents'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const WeeklyReports = lazy(() => import('./pages/admin/WeeklyReports'));
const ManageTasks = lazy(() => import('./pages/admin/ManageTasks'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'));
const ManageRequest = lazy(() => import('./pages/admin/ManageRequest'));
const ManageFeedback = lazy(() => import('./pages/admin/ManageFeedback'));
const ManageAnnouncement = lazy(() => import('./pages/admin/ManageAnnouncement'));
const ManageForgotPassword = lazy(() => import('./pages/admin/ManageForgotPassword'));
const ManageAskQuestion = lazy(() => import('./pages/admin/ManageAskQuestion'));
const ManageSubmission = lazy(() => import('./pages/admin/ManageSubmission'));
const AdminCode = lazy(() => import('./pages/admin/AdminCode'));
const ManageAuditLog = lazy(() => import('./pages/admin/ManageAuditLog'));

// Student Pages
const StudentLayout = lazy(() => import('./pages/student/StudentLayout'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const MyTasks = lazy(() => import('./pages/student/MyTasks'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const StudentSettings = lazy(() => import('./pages/student/StudentSettings'));
const StudentCalendar = lazy(() => import('./pages/student/StudentCalendar'));
const StudentRequest = lazy(() => import('./pages/student/StudentRequest'));
const StudentFeedback = lazy(() => import('./pages/student/StudentFeedback'));
const StudentAnnouncements = lazy(() => import('./pages/student/StudentAnnouncements'));
const StudentAsk = lazy(() => import('./pages/student/StudentAskQuestion'));
const StudentSubmission = lazy(() => import('./pages/student/StudentSubmission'));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading MentorLog...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} /> 
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/" />} />

          {/* --- Admin Protected Routes --- */}
          {[
            { path: "/admin-dashboard", element: <AdminDashboard /> },
            { path: "/manage-students", element: <ManageStudents /> },
            { path: "/manage-attendance", element: <ManageAttendance /> },
            { path: "/manage-requests", element: <ManageRequest /> },
            { path: "/admin-calendar", element: <AdminCalendar /> }, 
            { path: "/manage-tasks", element: <ManageTasks /> },
            { path: "/weekly-reports", element: <WeeklyReports /> },
            { path: "/admin-profile", element: <AdminProfile /> }, 
            { path: "/admin-settings", element: <AdminSettings /> },
            { path: "/manage-feedback", element: <ManageFeedback /> },
            { path: "/manage-announcements", element: <ManageAnnouncement /> },
            { path: "/manage-forgot-password", element: <ManageForgotPassword /> },
            { path: "/admin/ask-question", element: <ManageAskQuestion /> },
            { path: "/manage-submissions", element: <ManageSubmission /> },
            { path: "/admin/manage-submissions", element: <ManageSubmission /> },
            { path: "/manage-audit-logs", element: <ManageAuditLog /> },
            { path: "/admin/manage-codes", element: <AdminCode /> }
          ].map((route) => (
            <Route 
              key={route.path}
              path={route.path} 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    {route.element}
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
          ))}

          {/* --- Student Protected Routes --- */}
          {[
            { path: "/student-dashboard", element: <StudentDashboard /> },
            { path: "/tasks", element: <MyTasks /> },
            { path: "/student-profile", element: <StudentProfile /> },
            { path: "/settings", element: <StudentSettings /> },
            { path: "/campus-events", element: <StudentCalendar /> },
            { path: "/student-request", element: <StudentRequest /> },
            { path: "/submit-feedback", element: <StudentFeedback /> },
            { path: "/announcements", element: <StudentAnnouncements /> },
            { path: "/StudentAsk", element: <StudentAsk /> },
            { path: "/submissions", element: <StudentSubmission /> },
          ].map((route) => (
            <Route 
              key={route.path}
              path={route.path} 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout>
                    {route.element}
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
          ))}
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;