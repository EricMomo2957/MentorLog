import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage'; // 1. IMPORT LANDING PAGE
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAttendance from './pages/admin/ManageAttendance';
import ManageStudents from './pages/admin/ManageStudents'; 
import AdminSettings from './pages/admin/AdminSettings';
import WeeklyReports from './pages/admin/WeeklyReports';
import ManageTasks from './pages/admin/ManageTasks'; 
import AdminProfile from './pages/admin/AdminProfile';
import AdminCalendar from './pages/admin/AdminCalendar';
import ManageRequest from './pages/admin/ManageRequest';
import ManageFeedback from './pages/admin/ManageFeedback';
import ManageAnnouncement from './pages/admin/ManageAnnouncement';
import ReportAnalytics from './pages/admin/ReportAnalytics';
import ManageForgotPassword from './pages/admin/ManageForgotPassword';
import ManageAskQuestion from './pages/admin/ManageAskQuestion';
import ManageSubmission from './pages/admin/ManageSubmission';
import AdminCode from './pages/admin/AdminCode';
import ManageAuditLog from './pages/admin/ManageAuditLog';

// Student Imports
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import MyTasks from './pages/student/MyTasks'; 
import StudentProfile from './pages/student/StudentProfile';
import StudentSettings from './pages/student/StudentSettings';
import StudentCalendar from './pages/student/StudentCalendar';
import StudentRequest from './pages/student/StudentRequest';
import StudentFeedback from './pages/student/StudentFeedback';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import StudentAsk from './pages/student/StudentAskQuestion'; 
import StudentSubmission from './pages/student/StudentSubmission';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        {/* 2. SET LANDING AS THE BASE ROUTE */}
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
          { path: "/admin/reports", element: <ReportAnalytics /> },
          { path: "/manage-announcements", element: <ManageAnnouncement /> },
          { path: "/manage-forgot-password", element: <ManageForgotPassword /> },
          { path: "/admin/ask-question", element: <ManageAskQuestion /> },
          { path: "/manage-submissions", element: <ManageSubmission /> },
          { path: "/admin/manage-submissions", element:<ManageSubmission /> },
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
          { 
            path: "/my-attendance", 
            element: (
              <div className="p-10 text-white">
                <h1 className="text-3xl font-black mb-4">My Attendance</h1>
                <p className="text-slate-400">Attendance Feature Coming Soon...</p>
              </div>
            ) 
          },
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
        {/* 3. CHANGE FALLBACK TO LANDING OR LOGIN */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;