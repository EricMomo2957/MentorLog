# 🎓 MentorLog — OJT Attendance & Task Management System

![MentorLog Banner](https://img.shields.io/badge/MentorLog-OJT%20Management%20System-4F46E5?style=for-the-badge&logo=react&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-Bridge_API-777BB4?style=flat-square&logo=php&logoColor=white)

**MentorLog** is a comprehensive, full-stack On-the-Job Training (OJT) Management Platform designed to streamline attendance logging, task assignments, document submissions, progress tracking, and communication between mentors, administrators, and student interns.

---

## 🚀 Key Features

### 👨‍🎓 Student Portal
- **Dashboard Overview:** Real-time metrics for completed tasks, total rendered OJT hours, upcoming deadlines, and announcements.
- **Task Management & Submissions:** View assigned tasks, track status (Pending, In Progress, Completed), submit deliverables with file attachments.
- **Attendance Tracking & Schedule Upload:** Log clock-in / clock-out times and upload schedule documents (with OCR schedule verification support).
- **Document Management:** Submit mandatory OJT requirements (Resume, MOA, Endorsement Letters, Daily Time Records).
- **Q&A & Requests:** Submit inquiries directly to mentors via the Ask Question portal and file leave or schedule adjustment requests.
- **Announcements & Calendar:** Interactive event calendar and real-time announcement feed.

### 🛡️ Admin & Mentor Portal
- **Student Management:** Overview of all registered interns, status controls, progress monitoring, and profile management.
- **Task Assignment & Review:** Create, update, assign, and delete tasks for individual students or cohorts. Review and approve student submissions.
- **Attendance & Audit Log System:** Comprehensive audit logging tracking all system actions and attendance verification.
- **Analytics & Reporting:** Interactive charts (Chart.js & Recharts) visualizing completion rates, attendance trends, and weekly report summaries.
- **Security & Access Control:** Admin verification codes management, password reset handler, and protected role-based routing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Chart.js, Recharts, React Router v7, Axios |
| **Backend** | Node.js, Express.js, TypeScript, MySQL2, JSON Web Tokens (JWT), Bcrypt.js, Multer (File Uploads), Nodemon |
| **Database** | MySQL (XAMPP / Standalone server) |
| **Bridge Layer** | PHP (Direct MySQL endpoints for custom web service integration) |

---

## 📂 Project Structure

```
MentorLog/
├── backend/                        # Node.js + Express TypeScript REST API
│   ├── src/
│   │   ├── app.ts                  # Server entry point & API route definitions
│   │   ├── config/                 # Database connection pool (MySQL2)
│   │   ├── controllers/            # 14 Controller modules for core services
│   │   ├── middleware/             # JWT Authentication middleware
│   │   ├── routes/                 # Express route definitions
│   │   └── utils/                  # Utility functions & helpers
│   ├── uploads/                    # File upload directory (Avatars, Submissions, OCR)
│   ├── .env                        # Server environment configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   └── frontend/                   # React + Vite TypeScript Frontend App
│       ├── src/
│       │   ├── App.tsx             # Main routing & application state
│       │   ├── auth/               # Auth components (Login, Register)
│       │   ├── components/         # Protected routes & reusable components
│       │   ├── pages/
│       │   │   ├── admin/          # 20 Admin/Mentor management views
│       │   │   ├── student/        # 11 Student portal views
│       │   │   └── LandingPage.tsx # Public landing page
│       │   └── services/           # Axios API service client
│       ├── package.json
│       ├── tailwind.config.js
│       └── vite.config.ts
│
└── php-bridge/                     # PHP Scripts for standalone DB services
    ├── db_connection.php           # MySQL connection setup
    ├── get-tasks.php / assign-task.php / create-task.php
    ├── get-students.php / update-profile.php
    └── update-task-status.php
```

---

## ⚙️ Getting Started & Installation

### Prerequisites

Ensure you have the following software installed on your development machine:
- **Node.js** (v18.x or higher) & **npm**
- **XAMPP** (or a local MySQL Server instance)
- **PHP** (v8.0+ for running the PHP Bridge if needed)
- **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/EricMomo2957/MentorLog.git
cd MentorLog
```

---

### Step 2: Database Setup

1. Start **Apache** and **MySQL** services in your XAMPP Control Panel.
2. Open PHPMyAdmin at `http://localhost/phpmyadmin`.
3. Create a new database named `mentorlog_db`.
4. Import your database schema tables into `mentorlog_db`.

---

### Step 3: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file in `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=mentorlog_db
   JWT_SECRET=your_super_secret_jwt_key_here
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start at `http://localhost:5000` with Audit Logging active.*

---

### Step 4: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

### Step 5: PHP Bridge Setup (Optional)

If using the PHP bridge endpoints, ensure the project root is located within your local server web directory:
- Path: `c:/xampp/htdocs/MentorLog/php-bridge/`
- Test connection by accessing `http://localhost/MentorLog/php-bridge/db_connection.php`.

---

## 🔗 Key API Endpoints Overview

| Service | HTTP Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new student or mentor account | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user and issue JWT | Public |
| **Students** | `GET` | `/api/admin/students` | Retrieve list of all interns | Admin |
| **Audit Logs**| `GET` | `/api/admin/audit-logs` | Retrieve system action logs | Admin |
| **Tasks** | `GET` / `POST` | `/api/tasks` | Fetch and assign OJT tasks | Protected |
| **Attendance**| `POST` | `/api/attendance` | Log clock-in / clock-out | Student |
| **Submissions**| `POST` | `/api/documents/upload` | Upload document deliverables | Student |
| **Analytics** | `GET` | `/api/analytics` | Fetch summary report metrics | Admin |

---

## 🤝 Contributing

Contributions are welcome! If you'd like to report bugs, request features, or submit improvements:
1. Fork the repository
2. Create a new feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git checkout -b feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Eric Dominic Momo**
- GitHub: [@EricMomo2957](https://github.com/EricMomo2957)

---

<p align="center">Made with ❤️ for efficient OJT & Mentorship Management.</p>
