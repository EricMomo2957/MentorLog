import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
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

// Student Imports
import StudentLayout from './pages/student/StudentLayout'; // <--- IMPORT LAYOUT
import StudentDashboard from './pages/student/StudentDashboard';
import MyTasks from './pages/student/MyTasks'; 
import StudentProfile from './pages/student/StudentProfile';
import StudentSettings from './pages/student/StudentSettings';
import StudentCalendar from './pages/student/StudentCalendar'; // <--- NEW IMPORT

interface Task {
  id: number;
  user_id: number;
  student_name?: string;
  title: string;
  task_description: string;
  status: 'Pending' | 'In-Progress' | 'Completed';
  due_date: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tasks');
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error("Failed to sync sidebar tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* --- Admin Protected Routes --- */}
        {[
          { path: "/admin-dashboard", element: <AdminDashboard /> },
          { path: "/manage-students", element: <ManageStudents /> },
          { path: "/manage-attendance", element: <ManageAttendance /> },
          { path: "/admin-calendar", element: <AdminCalendar /> },
          { path: "/manage-tasks", element: <ManageTasks /> },
          { path: "/weekly-reports", element: <WeeklyReports /> },
          { path: "/admin-profile", element: <AdminProfile /> }, 
          { path: "/admin-settings", element: <AdminSettings /> },
        ].map((route) => (
          <Route 
            key={route.path}
            path={route.path} 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout tasks={tasks}>
                  {route.element}
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
        ))}

        {/* --- Student Protected Routes --- */}
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentDashboard />
              </StudentLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <MyTasks />
              </StudentLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/student-profile" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentProfile />
              </StudentLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentSettings />
              </StudentLayout>
            </ProtectedRoute>
          } 
        />

        {/* --- ADDED STUDENT CALENDAR ROUTE --- */}
        <Route 
          path="/campus-events" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentCalendar />
              </StudentLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/my-attendance" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <div className="p-10 text-white bg-[#0f172a] min-h-screen">
                  <h1 className="text-3xl font-black mb-4 uppercase italic">My Attendance</h1>
                  <p className="text-slate-400 font-medium">Attendance Feature Coming Soon...</p>
                </div>
              </StudentLayout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;