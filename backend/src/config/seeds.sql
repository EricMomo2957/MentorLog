-- ==============================================================================
-- MentorLog - Database Seed Data (seeds.sql)
-- Generated for MySQL (mentorlog_db)
-- Contains at least 10 realistic sample records for every table
-- ==============================================================================

USE `mentorlog_db`;

-- Temporarily disable foreign key checks for clean seeding
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `question_replies`;
TRUNCATE TABLE `intern_questions`;
TRUNCATE TABLE `tasks`;
TRUNCATE TABLE `service_requests`;
TRUNCATE TABLE `feedbacks`;
TRUNCATE TABLE `events`;
TRUNCATE TABLE `document_submissions`;
TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `attendance`;
TRUNCATE TABLE `announcements`;
TRUNCATE TABLE `admin_codes`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `password_resets`;
TRUNCATE TABLE `email_verifications`;
-- Optional evaluations table if exists
DROP TABLE IF EXISTS `evaluations`;
CREATE TABLE IF NOT EXISTS `evaluations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `evaluator_id` int(11) NOT NULL,
  `evaluation_type` enum('Midterm', 'Final') NOT NULL,
  `professionalism` int(11) NOT NULL DEFAULT 5,
  `technical_skills` int(11) NOT NULL DEFAULT 5,
  `punctuality` int(11) NOT NULL DEFAULT 5,
  `communication` int(11) NOT NULL DEFAULT 5,
  `overall_score` decimal(3,2) NOT NULL DEFAULT 5.00,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `evaluator_id` (`evaluator_id`),
  CONSTRAINT `fk_evaluations_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_evaluations_evaluator` FOREIGN KEY (`evaluator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
TRUNCATE TABLE `evaluations`;

TRUNCATE TABLE `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 1. USERS (2 Admins + 10 Student Interns)
-- Default Password for all seeded accounts: "password123"
-- Bcrypt Hash: $2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a
-- ==============================================================================
INSERT INTO `users` (
  `id`, `member_title`, `first_name`, `middle_name`, `last_name`, `id_number`,
  `full_name`, `email`, `phone`, `date_of_birth`, `age`, `gender`, `civil_status`,
  `address`, `school_name`, `student_id`, `course`, `year_level`, `it_position`,
  `ojt_hours_required`, `required_hours`, `password`, `role`, `is_active`, `profile_pic`
) VALUES
-- Admins / Mentors
(1, 'Lead Mentor', 'Robert', 'Alan', 'Vance', 'ADM-001', 'Robert Vance', 'admin@mentorlog.com', '09171234567', '1985-04-12', 41, 'Male', 'Married', 'Unit 102, Tech Heights, Makati City', 'University of the Philippines', 'ADM-001', 'MS Computer Science', 'N/A', 'OJT Program Supervisor', 0, 0, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'admin', 1, NULL),
(2, 'OJT Coordinator', 'Elena', 'Grace', 'Reyes', 'ADM-002', 'Elena Reyes', 'elena.reyes@mentorlog.com', '09189876543', '1990-09-23', 35, 'Female', 'Single', '45 Emerald Ave, Ortigas Center, Pasig', 'De La Salle University', 'ADM-002', 'BS Information Tech', 'N/A', 'Technical Mentor & Coordinator', 0, 0, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'admin', 1, NULL),

-- 10 Student Interns
(3, 'Intern', 'Alex', 'James', 'Johnson', 'STU-2026-001', 'Alex Johnson', 'alex.johnson@student.edu', '09191112233', '2003-05-14', 23, 'Male', 'Single', '12 Rosal St., Quezon City', 'State University of Technology', 'STU-2026-001', 'BS Information Technology', '4th Year', 'Full Stack Web Developer', 600, 600, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'student', 1, NULL),
(4, 'Intern', 'Maria', 'Clara', 'Santos', 'STU-2026-002', 'Maria Santos', 'maria.santos@student.edu', '09202223344', '2004-02-18', 22, 'Female', 'Single', '88 Sampaguita Blvd., Manila', 'National Science Academy', 'STU-2026-002', 'BS Computer Science', '4th Year', 'Frontend Web Developer', 500, 500, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'student', 1, NULL),
(5, 'Intern', 'David', 'Lee', 'Cruz', 'STU-2026-003', 'David Cruz', 'david.cruz@student.edu', '09213334455', '2003-11-30', 22, 'Male', 'Single', '15 Dahlia Ave., Pasig City', 'Metropolitan Institute of Tech', 'STU-2026-003', 'BS Information Systems', '4th Year', 'Data Analyst / BI Specialist', 600, 600, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'student', 1, NULL),
(6, 'Intern', 'Samantha', 'Joy', 'Aquino', 'STU-2026-004', 'Samantha Aquino', 'samantha.aquino@student.edu', '09224445566', '2004-07-09', 22, 'Female', 'Single', '204 Acacia Lane, Mandaluyong', 'Technological Institute of the Phils', 'STU-2026-004', 'BS Computer Science', '4th Year', 'UI/UX & Frontend Designer', 600, 600, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'student', 1, NULL),
(7, 'Intern', 'Kevin', 'Bryan', 'Tan', 'STU-2026-005', 'Kevin Tan', 'kevin.tan@student.edu', '09235556677', '2002-12-05', 23, 'Male', 'Single', '77 MacArthur Highway, Valenzuela', 'Polytechnic University of the Phils', 'STU-2026-005', 'BS Information Technology', '4th Year', 'Backend API & Database Engineer', 550, 550, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'student', 1, NULL),
(8, 'Intern', 'Chloe', 'Nicole', 'Mendoza', 'STU-2026-006', 'Chloe Mendoza', 'chloe.mendoza@student.edu', '09246667788', '2003-08-21', 23, 'Female', 'Single', '31 Sunset Drive, Paranaque City', 'Ateneo de Manila University', 'STU-2026-006', 'BS Management Information Systems', '4th Year', 'Quality Assurance & Testing Intern', 600, 600, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'student', 1, NULL),
(9, 'Intern', 'Joshua', 'Paul', 'Ramos', 'STU-2026-007', 'Joshua Ramos', 'joshua.ramos@student.edu', '09257778899', '2003-03-15', 23, 'Male', 'Single', '50 Mabini St., Caloocan City', 'University of Santo Tomas', 'STU-2026-007', 'BS Information Technology', '4th Year', 'Mobile App Developer (Flutter/React Native)', 600, 600, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'student', 1, NULL),
(10, 'Intern', 'Patricia', 'Mae', 'Villanueva', 'STU-2026-008', 'Patricia Villanueva', 'patricia.v@student.edu', '09268889900', '2004-10-10', 21, 'Female', 'Single', '109 Bonifacio St., Taguig City', 'Adamson University', 'STU-2026-008', 'BS Computer Science', '3rd Year', 'Cloud Infrastructure & DevOps Intern', 500, 500, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'student', 1, NULL),
(11, 'Intern', 'Christian', 'Dale', 'Garcia', 'STU-2026-009', 'Christian Garcia', 'christian.garcia@student.edu', '09279990011', '2003-01-25', 23, 'Male', 'Single', '412 Aurora Blvd., San Juan City', 'Far Eastern University', 'STU-2026-009', 'BS Information Technology', '4th Year', 'Cybersecurity & Audit Specialist', 600, 600, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'student', 1, NULL),
(12, 'Intern', 'Hannah', 'Beatriz', 'Dizon', 'STU-2026-010', 'Hannah Dizon', 'hannah.dizon@student.edu', '09280001122', '2004-06-19', 22, 'Female', 'Single', '93 Katipunan Ave., Quezon City', 'Mapua University', 'STU-2026-010', 'BS Computer Engineering', '4th Year', 'Embedded Systems & IoT Intern', 600, 600, '$2b$10$3euPcmQFCiblsZeEu5s7p.V6u3bK3Z19c0jY4Z4wz9g7kOaIe6b9a', 'student', 1, NULL);

-- ==============================================================================
-- 2. TASKS (10 Sample Tasks assigned to students)
-- ==============================================================================
INSERT INTO `tasks` (`id`, `user_id`, `title`, `task_description`, `status`, `due_date`) VALUES
(1, 3, 'Setup JWT Authentication Flow', 'Implement access token and refresh token handling with proper auth interceptors.', 'Completed', '2026-08-10'),
(2, 3, 'Build Attendance Summary Widget', 'Create a visual chart displaying weekly attendance hours and overtime.', 'In-Progress', '2026-09-05'),
(3, 4, 'Refactor Student Dashboard UI', 'Redesign student dashboard with Tailwind v4 responsive grid and dark mode support.', 'Completed', '2026-08-15'),
(4, 4, 'Create Printable DTR Modal', 'Design printable HTML/CSS table conforming to CHED OJT Daily Time Record standard.', 'Completed', '2026-08-20'),
(5, 5, 'Data Export Module for Attendance', 'Implement CSV and Excel export endpoints for student clock-in records.', 'Completed', '2026-08-18'),
(6, 6, 'Design Interactive Calendar Component', 'Integrate date-fns and build event popovers for company holidays and deadlines.', 'In-Progress', '2026-09-08'),
(7, 7, 'Database Indexing & Query Optimization', 'Add indexes on foreign keys and optimize user query performance in MySQL.', 'In-Progress', '2026-09-10'),
(8, 8, 'Write End-to-End Test Plan', 'Draft comprehensive test cases for student submission and evaluation modules.', 'Pending', '2026-09-12'),
(9, 9, 'Mobile Viewport Responsiveness Polish', 'Verify mobile drawer and sidebar transitions across iOS and Android browsers.', 'Pending', '2026-09-15'),
(10, 10, 'Docker Containerization Setup', 'Create Dockerfile and docker-compose.yml configuration for frontend, backend, and DB.', 'Pending', '2026-09-20');

-- ==============================================================================
-- 3. SERVICE_REQUESTS (10 Sample Service & Leave Requests)
-- ==============================================================================
INSERT INTO `service_requests` (`id`, `student_id`, `student_name`, `subject`, `message`, `status`, `urgency`, `created_at`) VALUES
(1, 3, 'Alex Johnson', 'Schedule Adjustment for Midterms', 'Requesting shift adjustment on Friday from 1:00 PM to 6:00 PM due to university examination.', 'Accepted', 'Normal', '2026-08-05 08:30:00'),
(2, 4, 'Maria Santos', 'Medical Leave Certificate Submission', 'Filing sick leave for August 12 due to acute flu. Medical certificate attached in documents.', 'Accepted', 'Urgent', '2026-08-12 09:15:00'),
(3, 5, 'David Cruz', 'Request for Remote Work Option', 'Requesting 2 days work-from-home approval due to transport strike announced in Metro Manila.', 'Accepted', 'Normal', '2026-08-14 10:00:00'),
(4, 6, 'Samantha Aquino', 'Official Endorsement Letter Re-issue', 'Requesting a signed copy of the updated OJT endorsement letter addressed to the HR department.', 'Processing', 'Normal', '2026-08-20 14:20:00'),
(5, 7, 'Kevin Tan', 'Hardware Equipment Access Request', 'Requesting access to company test server and staging database credentials.', 'Accepted', 'Immediate Attention', '2026-08-22 11:00:00'),
(6, 8, 'Chloe Mendoza', 'Emergency Family Leave', 'Requesting emergency leave on Monday due to urgent family matters.', 'Accepted', 'Urgent', '2026-08-24 07:45:00'),
(7, 9, 'Joshua Ramos', 'DTR Overtime Correction Request', 'Forgot to clock out on August 21 due to system maintenance. Requesting manual adjustment of 3 hours.', 'Processing', 'Normal', '2026-08-25 16:30:00'),
(8, 10, 'Patricia Villanueva', 'Certificate of Appearance for School', 'Requesting signed Certificate of Appearance for our faculty OJT coordinator campus visit.', 'Pending', 'Normal', '2026-08-26 13:10:00'),
(9, 11, 'Christian Garcia', 'Software License Request for Burp Suite', 'Requesting approval to install security audit tooling on assigned development workstation.', 'Pending', 'Normal', '2026-08-27 15:40:00'),
(10, 12, 'Hannah Dizon', 'Shift Extension Request', 'Requesting 2 hours overtime daily next week to fulfill remaining target hours ahead of finals.', 'Rejected', 'Normal', '2026-08-28 09:00:00');

-- ==============================================================================
-- 4. INTERN_QUESTIONS (10 Q&A Threads)
-- ==============================================================================
INSERT INTO `intern_questions` (`id`, `student_id`, `subject`, `message`, `admin_reply`, `status`, `created_at`) VALUES
(1, 3, 'How to format database migrations?', 'Should we write raw SQL migrations or use a migration framework like Knex?', 'Please use standard SQL files in backend/src/config/ for now. We will review together during sprint review.', 'replied', '2026-08-02 10:00:00'),
(2, 4, 'Guideline on Tailwind v4 color tokens', 'What is the approved primary color palette for the MentorLog portal?', 'We are using Indigo (#4F46E5) for primary accents and Slate-900 for dark surfaces.', 'replied', '2026-08-04 11:30:00'),
(3, 5, 'DTR Minimum Rendered Hours Policy', 'Is there a maximum allowable rendered hours per day for OJT computation?', 'Yes, maximum allowable is 8 hours per day in compliance with CHED OJT guidelines.', 'replied', '2026-08-07 14:15:00'),
(4, 6, 'Where to submit revised MOA?', 'Our university Dean signed the updated MOA. Where should I upload the PDF?', 'Please navigate to Document Submissions and select Memorandum of Agreement (MOA).', 'replied', '2026-08-11 09:45:00'),
(5, 7, 'API Error Handling Standard', 'Are we using standard JSON responses with success, data, and error fields?', 'Yes, all controllers should return `{ success: boolean, message: string, data?: any }`.', 'replied', '2026-08-16 16:00:00'),
(6, 8, 'Schedule for Midterm Performance Review', 'When will the midterm evaluation rubric scores be posted?', 'Midterm appraisals will be conducted from August 25 to 30 with each mentor.', 'replied', '2026-08-19 13:20:00'),
(7, 9, 'Using external UI component libraries', 'Can we use Lucide React icons across all student dashboard subviews?', 'Yes, Lucide React is our approved icon pack. Please avoid mixing other icon sets.', 'replied', '2026-08-21 10:10:00'),
(8, 10, 'Git Branching Strategy', 'Should we push directly to feature branches or create individual fork repositories?', 'Create feature branches named `feature/your-task-name` and submit PRs for review.', 'replied', '2026-08-23 15:00:00'),
(9, 11, 'Security Header Configuration', 'Is Helmet package configured for Content Security Policy in Express?', 'Yes, Helmet is initialized in app.ts with custom CSP directives for uploads.', 'pending', '2026-08-27 11:25:00'),
(10, 12, 'OJT Completion Certificate Release', 'How many days after reaching 600 hours will the certificate be generated?', 'The system auto-unlocks the Certificate of Completion modal as soon as required hours reach 100%.', 'closed', '2026-08-28 14:50:00');

-- ==============================================================================
-- 5. QUESTION_REPLIES (10 Thread Replies)
-- ==============================================================================
INSERT INTO `question_replies` (`id`, `question_id`, `sender_id`, `sender_role`, `reply_text`, `created_at`) VALUES
(1, 1, 1, 'admin', 'Please check src/config/schema_mysql.sql as the baseline reference.', '2026-08-02 10:30:00'),
(2, 1, 3, 'intern', 'Understood! I will align my pull request with this schema.', '2026-08-02 10:45:00'),
(3, 2, 2, 'admin', 'Also check frontend/src/index.css for utility variables.', '2026-08-04 12:00:00'),
(4, 3, 1, 'admin', 'Overtime beyond 8 hours requires prior approval from the mentor.', '2026-08-07 14:30:00'),
(5, 4, 2, 'admin', 'Ensure the scanned document is below 10MB in PDF format.', '2026-08-11 10:00:00'),
(6, 5, 1, 'admin', 'Refer to backend/src/utils/logger.ts for logging exceptions.', '2026-08-16 16:30:00'),
(7, 6, 2, 'admin', 'Check your calendar tab for your specific 1-on-1 timeslot.', '2026-08-19 14:00:00'),
(8, 7, 1, 'admin', 'Keep icon sizes consistent using Tailwind `w-5 h-5` classes.', '2026-08-21 10:30:00'),
(9, 8, 2, 'admin', 'Do not forget to request review from at least one mentor before merge.', '2026-08-23 15:30:00'),
(10, 10, 1, 'admin', 'You can preview your certificate template in the My Evaluations tab.', '2026-08-28 15:15:00');

-- ==============================================================================
-- 6. PASSWORD_RESETS (10 Password Reset Records)
-- ==============================================================================
INSERT INTO `password_resets` (`id`, `full_name`, `email`, `status`, `requested_at`) VALUES
(1, 'Alex Johnson', 'alex.johnson@student.edu', 'resolved', '2026-08-01 09:12:00'),
(2, 'Maria Santos', 'maria.santos@student.edu', 'resolved', '2026-08-03 14:40:00'),
(3, 'David Cruz', 'david.cruz@student.edu', 'resolved', '2026-08-06 18:22:00'),
(4, 'Samantha Aquino', 'samantha.aquino@student.edu', 'resolved', '2026-08-10 11:05:00'),
(5, 'Kevin Tan', 'kevin.tan@student.edu', 'resolved', '2026-08-15 08:30:00'),
(6, 'Chloe Mendoza', 'chloe.mendoza@student.edu', 'resolved', '2026-08-18 16:50:00'),
(7, 'Joshua Ramos', 'joshua.ramos@student.edu', 'resolved', '2026-08-20 12:10:00'),
(8, 'Patricia Villanueva', 'patricia.v@student.edu', 'pending', '2026-08-26 10:00:00'),
(9, 'Christian Garcia', 'christian.garcia@student.edu', 'pending', '2026-08-27 13:45:00'),
(10, 'Hannah Dizon', 'hannah.dizon@student.edu', 'pending', '2026-08-29 08:20:00');

-- ==============================================================================
-- 7. FEEDBACKS (10 Student & Mentor Feedback Entries)
-- ==============================================================================
INSERT INTO `feedbacks` (`id`, `student_id`, `student_name`, `category`, `content`, `rating`, `created_at`) VALUES
(1, 3, 'Alex Johnson', 'Mentorship Quality', 'The mentors provide very clear architectural guidance and timely feedback on PRs.', 5, '2026-08-10 17:00:00'),
(2, 4, 'Maria Santos', 'Work Environment', 'Collaborative and supportive team atmosphere. Excellent learning opportunities.', 5, '2026-08-12 16:45:00'),
(3, 5, 'David Cruz', 'Platform Usability', 'MentorLog attendance clock-in interface is very responsive and easy to use.', 4, '2026-08-15 17:30:00'),
(4, 6, 'Samantha Aquino', 'Task Clarity', 'Task descriptions are very detailed with clear acceptance criteria and wireframes.', 5, '2026-08-18 18:00:00'),
(5, 7, 'Kevin Tan', 'Technical Learning', 'Gained tremendous experience with TypeScript, Express middleware, and SQL pooling.', 5, '2026-08-20 17:15:00'),
(6, 8, 'Chloe Mendoza', 'Communication', 'Weekly sprint planning meetings keep all interns aligned on project milestones.', 4, '2026-08-22 16:30:00'),
(7, 9, 'Joshua Ramos', 'Resources & Tooling', 'Great tools provided. Requesting additional workshops on deployment pipelines.', 4, '2026-08-24 17:00:00'),
(8, 10, 'Patricia Villanueva', 'Workload & Schedule', 'Fair workload distribution with reasonable deadlines that accommodate university classes.', 5, '2026-08-26 16:50:00'),
(9, 11, 'Christian Garcia', 'Security Training', 'Appreciated the hands-on session regarding JWT auth and SQL injection prevention.', 5, '2026-08-27 17:20:00'),
(10, 12, 'Hannah Dizon', 'Overall Experience', 'Overall OJT program has significantly improved my programming confidence.', 5, '2026-08-28 17:10:00');

-- ==============================================================================
-- 8. EVENTS (10 Calendar Events)
-- ==============================================================================
INSERT INTO `events` (`id`, `user_id`, `title`, `description`, `location`, `start_time`, `end_time`, `created_at`) VALUES
(1, 1, 'OJT Cohort General Orientation', 'Welcome meeting and introduction to company development standards and toolchains.', 'Main Auditorium / Zoom', '2026-08-01 09:00:00', '2026-08-01 12:00:00', '2026-07-28 10:00:00'),
(2, 1, 'Git & GitHub Workflow Workshop', 'Best practices for branching, rebasing, pull requests, and semantic commit messages.', 'Training Room B', '2026-08-08 13:00:00', '2026-08-08 16:00:00', '2026-08-03 09:30:00'),
(3, 2, 'Midterm Performance Review Week', 'Individual 1-on-1 progress appraisal between student interns and assigned mentors.', 'Meeting Room 3', '2026-08-25 09:00:00', '2026-08-29 17:00:00', '2026-08-15 11:00:00'),
(4, 1, 'National Heroes Day (Holiday)', 'Non-working official Philippine holiday. No attendance logging required.', 'Company Wide', '2026-08-31 00:00:00', '2026-08-31 23:59:59', '2026-08-20 08:00:00'),
(5, 2, 'TypeScript & Clean Architecture Tech Talk', 'Mastering TypeScript generics, interface design, and Express controller patterns.', 'Conference Hall A', '2026-09-04 14:00:00', '2026-09-04 16:30:00', '2026-08-22 14:00:00'),
(6, 1, 'Sprint 2 Milestone Demo Day', 'Interns present deliverables completed for Sprint 2 to the engineering lead.', 'Zoom Stage 1', '2026-09-11 10:00:00', '2026-09-11 12:00:00', '2026-08-24 10:30:00'),
(7, 2, 'Cybersecurity Best Practices Seminar', 'OWASP Top 10 web vulnerabilities, authentication cookies, and CSRF defense.', 'Virtual Room 4', '2026-09-18 13:30:00', '2026-09-18 15:30:00', '2026-08-25 15:00:00'),
(8, 1, 'Faculty Adviser Coordination Meeting', 'Consultation meeting with university internship faculty coordinators.', 'Executive Boardroom', '2026-09-25 10:00:00', '2026-09-25 11:30:00', '2026-08-26 11:15:00'),
(9, 2, 'Final Capstone Project Defense', 'Final presentation of project contributions and OJT portfolio submissions.', 'Main Hall', '2026-10-15 09:00:00', '2026-10-15 16:00:00', '2026-08-27 16:00:00'),
(10, 1, 'OJT Culmination & Certificate Ceremony', 'Graduation ceremony celebrating successful completion of required internship hours.', 'Grand Ballroom', '2026-10-25 14:00:00', '2026-10-25 18:00:00', '2026-08-28 09:00:00');

-- ==============================================================================
-- 9. DOCUMENT_SUBMISSIONS (10 Sample Document Submissions)
-- ==============================================================================
INSERT INTO `document_submissions` (`id`, `student_id`, `student_name`, `document_type`, `file_path`, `status`, `submitted_at`, `feedback`) VALUES
(1, 3, 'Alex Johnson', 'Resume / Curriculum Vitae', 'uploads/documents/alex_johnson_resume.pdf', 'approved', '2026-08-01 10:00:00', 'Resume verified. Great portfolio projects.'),
(2, 3, 'Alex Johnson', 'Memorandum of Agreement (MOA)', 'uploads/documents/alex_johnson_moa.pdf', 'approved', '2026-08-02 11:30:00', 'Signed and notarized MOA accepted.'),
(3, 4, 'Maria Santos', 'Endorsement Letter', 'uploads/documents/maria_santos_endorsement.pdf', 'approved', '2026-08-02 14:00:00', 'University endorsement letter confirmed.'),
(4, 4, 'Maria Santos', 'Medical Certificate', 'uploads/documents/maria_santos_medcert.pdf', 'approved', '2026-08-12 10:00:00', 'Medical leave verified.'),
(5, 5, 'David Cruz', 'Daily Time Record (DTR) - Week 1', 'uploads/documents/david_cruz_dtr_w1.pdf', 'approved', '2026-08-09 17:30:00', 'DTR hours match biometrics.'),
(6, 6, 'Samantha Aquino', 'Parents Consent Form', 'uploads/documents/samantha_consent.pdf', 'approved', '2026-08-03 09:00:00', 'Valid guardian signature confirmed.'),
(7, 7, 'Kevin Tan', 'NBI / Police Clearance', 'uploads/documents/kevin_tan_clearance.pdf', 'approved', '2026-08-04 15:45:00', 'Clearance accepted.'),
(8, 8, 'Chloe Mendoza', 'Insurance Policy Form', 'uploads/documents/chloe_insurance.pdf', 'rejected', '2026-08-05 13:10:00', 'Document scan was blurry. Please re-upload a clear copy.'),
(9, 9, 'Joshua Ramos', 'Daily Time Record (DTR) - Week 2', 'uploads/documents/joshua_ramos_dtr_w2.pdf', 'pending', '2026-08-22 18:00:00', 'Pending review by supervisor.'),
(10, 10, 'Patricia Villanueva', 'Certificate of Registration', 'uploads/documents/patricia_cor.pdf', 'pending', '2026-08-25 14:30:00', 'Pending verification.');

-- ==============================================================================
-- 10. AUDIT_LOGS (10 System Security & Activity Audit Logs)
-- ==============================================================================
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `module`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'LOGIN_SUCCESS', 'AUTH', 'Admin Robert Vance logged into dashboard', '192.168.1.10', '2026-08-29 08:00:15'),
(2, 3, 'CLOCK_IN', 'ATTENDANCE', 'Alex Johnson clocked in at 08:02:10', '192.168.1.45', '2026-08-29 08:02:10'),
(3, 4, 'CLOCK_IN', 'ATTENDANCE', 'Maria Santos clocked in at 08:15:22', '192.168.1.48', '2026-08-29 08:15:22'),
(4, 1, 'TASK_CREATE', 'TASKS', 'Created task "Setup JWT Authentication Flow" for Alex Johnson', '192.168.1.10', '2026-08-29 09:00:00'),
(5, 3, 'TASK_STATUS_UPDATE', 'TASKS', 'Task #1 status changed from In-Progress to Completed', '192.168.1.45', '2026-08-29 11:30:45'),
(6, 2, 'EVALUATION_SUBMIT', 'EVALUATIONS', 'Submitted Midterm Evaluation for Alex Johnson (Score: 4.85)', '192.168.1.12', '2026-08-29 13:15:00'),
(7, 5, 'DOCUMENT_UPLOAD', 'SUBMISSIONS', 'David Cruz uploaded DTR - Week 1', '192.168.1.52', '2026-08-29 14:00:20'),
(8, 1, 'DOCUMENT_APPROVE', 'SUBMISSIONS', 'Approved document submission ID #5', '192.168.1.10', '2026-08-29 14:30:10'),
(9, 6, 'SERVICE_REQUEST', 'REQUESTS', 'Samantha Aquino submitted leave request', '192.168.1.56', '2026-08-29 15:10:00'),
(10, 3, 'CLOCK_OUT', 'ATTENDANCE', 'Alex Johnson clocked out at 17:05:00 (Total: 8.50 hrs)', '192.168.1.45', '2026-08-29 17:05:00');

-- ==============================================================================
-- 11. ATTENDANCE (10+ Daily Clock-In / Clock-Out Records)
-- ==============================================================================
INSERT INTO `attendance` (`id`, `user_id`, `date`, `clock_in`, `clock_out`, `status`, `total_hours`, `is_active`) VALUES
(1, 3, '2026-08-25', '08:00:00', '17:00:00', 'Present', 8.00, 0),
(2, 3, '2026-08-26', '07:55:00', '17:05:00', 'Present', 8.15, 0),
(3, 3, '2026-08-27', '08:15:00', '17:15:00', 'Late', 8.00, 0),
(4, 3, '2026-08-28', '08:00:00', '17:00:00', 'Present', 8.00, 0),
(5, 4, '2026-08-25', '08:02:00', '17:02:00', 'Present', 8.00, 0),
(6, 4, '2026-08-26', '08:00:00', '17:00:00', 'Present', 8.00, 0),
(7, 4, '2026-08-27', '08:30:00', '17:30:00', 'Late', 8.00, 0),
(8, 5, '2026-08-25', '08:00:00', '17:00:00', 'Present', 8.00, 0),
(9, 5, '2026-08-26', '08:05:00', '17:05:00', 'Present', 8.00, 0),
(10, 6, '2026-08-25', '07:50:00', '16:50:00', 'Present', 8.00, 0),
(11, 7, '2026-08-25', '08:00:00', '17:00:00', 'Present', 8.00, 0),
(12, 8, '2026-08-25', '08:10:00', '17:10:00', 'Present', 8.00, 0);

-- ==============================================================================
-- 12. ANNOUNCEMENTS (10 Broadcast Announcements)
-- ==============================================================================
INSERT INTO `announcements` (`id`, `title`, `content`, `image_url`, `admin_id`, `created_at`) VALUES
(1, '🎉 Welcome to MentorLog OJT 2026!', 'We are excited to welcome our new batch of student interns across all partner universities. Please review your task roadmap and company guidelines.', NULL, 1, '2026-08-01 08:00:00'),
(2, '📋 Mandatory OJT Requirements Deadline', 'Please submit your scanned copies of MOA, Endorsement Letter, and Medical Certificate under the Submissions tab before August 15.', NULL, 2, '2026-08-03 09:30:00'),
(3, '⏰ DTR Clock-In / Clock-Out Reminder', 'All interns must log their daily attendance accurately. If you encounter any camera or connection errors, immediately file an attendance adjustment request.', NULL, 1, '2026-08-06 08:15:00'),
(4, '💡 Tech Stack Standardization Workshop', 'Join us this Friday for a hands-on walk-through of React 19, TypeScript best practices, and Tailwind CSS v4 styling rules.', NULL, 2, '2026-08-09 14:00:00'),
(5, '🏆 Midterm Evaluation Schedule Released', 'Midterm performance reviews will take place from August 25 to 30. Check your calendar for your assigned schedule with your mentor.', NULL, 1, '2026-08-15 10:00:00'),
(6, '🇵🇭 National Heroes Day Holiday Notice', 'Office operations are suspended on Monday, August 31, in observance of National Heroes Day. Enjoy the long weekend!', NULL, 2, '2026-08-20 11:30:00'),
(7, '🚀 System Maintenance Notice', 'MentorLog backend API will undergo database index maintenance on Saturday from 10:00 PM to 11:00 PM.', NULL, 1, '2026-08-22 16:00:00'),
(8, '📊 Sprint 2 Review & Presentation', 'All teams are requested to prepare their deliverable demos for the upcoming sprint review this coming Friday.', NULL, 2, '2026-08-24 13:45:00'),
(9, '🔒 Cybersecurity & Secret Management Reminder', 'Never commit API keys or database credentials to GitHub repositories. Always use .env files for local variables.', NULL, 1, '2026-08-26 09:00:00'),
(10, '🎓 OJT Certificate of Completion Preview', 'Students who complete their required hours (600 hrs) can now download their verified Certificate of Completion directly from the portal.', NULL, 2, '2026-08-28 15:30:00');

-- ==============================================================================
-- 13. ADMIN_CODES (10 Security Verification Codes)
-- ==============================================================================
INSERT INTO `admin_codes` (`id`, `code`, `is_used`, `created_by`, `created_at`) VALUES
(1, 'ML-ADMIN-9901', 1, 1, '2026-08-01 08:00:00'),
(2, 'ML-ADMIN-9902', 1, 1, '2026-08-01 08:05:00'),
(3, 'ML-ADMIN-8811', 0, 1, '2026-08-10 10:00:00'),
(4, 'ML-ADMIN-8812', 0, 1, '2026-08-10 10:05:00'),
(5, 'ML-ADMIN-7721', 0, 1, '2026-08-15 11:00:00'),
(6, 'ML-ADMIN-7722', 0, 1, '2026-08-15 11:05:00'),
(7, 'ML-ADMIN-6631', 0, 2, '2026-08-20 14:00:00'),
(8, 'ML-ADMIN-6632', 0, 2, '2026-08-20 14:05:00'),
(9, 'ML-ADMIN-5541', 0, 2, '2026-08-25 09:00:00'),
(10, 'ML-ADMIN-5542', 0, 2, '2026-08-25 09:05:00');

-- ==============================================================================
-- 14. NOTIFICATIONS (10 Sample User Notifications)
-- ==============================================================================
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 3, 'New Task Assigned', 'Mentor Robert Vance assigned you a new task: "Setup JWT Authentication Flow".', 'task', 1, '2026-08-01 09:05:00'),
(2, 3, 'Document Approved', 'Your Memorandum of Agreement (MOA) has been approved by admin.', 'success', 1, '2026-08-02 12:00:00'),
(3, 4, 'Service Request Update', 'Your schedule adjustment request for midterms was accepted.', 'info', 1, '2026-08-05 09:00:00'),
(4, 5, 'Announcement Posted', 'Admin posted a new announcement: "Mandatory OJT Requirements Deadline".', 'announcement', 1, '2026-08-06 08:30:00'),
(5, 6, 'Question Replied', 'Mentor Elena Reyes replied to your question regarding MOA upload.', 'question', 1, '2026-08-11 10:05:00'),
(6, 7, 'Attendance Alert', 'Your attendance record for August 25 was confirmed (8.00 hours).', 'attendance', 0, '2026-08-25 17:05:00'),
(7, 3, 'Evaluation Published', 'Your Midterm Performance Evaluation is now available for viewing.', 'evaluation', 0, '2026-08-26 14:00:00'),
(8, 8, 'Document Resubmission Required', 'Your Insurance Policy Form document was rejected. Please re-upload.', 'warning', 0, '2026-08-27 10:15:00'),
(9, 9, 'Upcoming Event Reminder', 'National Heroes Day non-working holiday on Monday, August 31.', 'event', 0, '2026-08-28 09:00:00'),
(10, 10, 'Task Deadline Approaching', 'Task "Docker Containerization Setup" is due in 3 days.', 'reminder', 0, '2026-08-29 08:00:00');

-- ==============================================================================
-- 15. EMAIL_VERIFICATIONS (10 OTP Verification Records)
-- ==============================================================================
INSERT INTO `email_verifications` (`id`, `email`, `otp_code`, `payload`, `expires_at`, `created_at`) VALUES
(1, 'alex.johnson@student.edu', '849201', '{"full_name":"Alex Johnson","role":"student"}', '2026-08-01 09:30:00', '2026-08-01 09:00:00'),
(2, 'maria.santos@student.edu', '194820', '{"full_name":"Maria Santos","role":"student"}', '2026-08-01 10:30:00', '2026-08-01 10:00:00'),
(3, 'david.cruz@student.edu', '582910', '{"full_name":"David Cruz","role":"student"}', '2026-08-01 11:30:00', '2026-08-01 11:00:00'),
(4, 'samantha.aquino@student.edu', '391028', '{"full_name":"Samantha Aquino","role":"student"}', '2026-08-02 09:30:00', '2026-08-02 09:00:00'),
(5, 'kevin.tan@student.edu', '918273', '{"full_name":"Kevin Tan","role":"student"}', '2026-08-02 10:30:00', '2026-08-02 10:00:00'),
(6, 'chloe.mendoza@student.edu', '627194', '{"full_name":"Chloe Mendoza","role":"student"}', '2026-08-02 11:30:00', '2026-08-02 11:00:00'),
(7, 'joshua.ramos@student.edu', '481920', '{"full_name":"Joshua Ramos","role":"student"}', '2026-08-03 08:30:00', '2026-08-03 08:00:00'),
(8, 'patricia.v@student.edu', '719284', '{"full_name":"Patricia Villanueva","role":"student"}', '2026-08-03 09:30:00', '2026-08-03 09:00:00'),
(9, 'christian.garcia@student.edu', '384910', '{"full_name":"Christian Garcia","role":"student"}', '2026-08-03 10:30:00', '2026-08-03 10:00:00'),
(10, 'hannah.dizon@student.edu', '294810', '{"full_name":"Hannah Dizon","role":"student"}', '2026-08-03 11:30:00', '2026-08-03 11:00:00');

-- ==============================================================================
-- 16. EVALUATIONS (10 Performance Evaluation Records)
-- ==============================================================================
INSERT INTO `evaluations` (
  `id`, `student_id`, `evaluator_id`, `evaluation_type`, `professionalism`,
  `technical_skills`, `punctuality`, `communication`, `overall_score`, `comments`, `created_at`
) VALUES
(1, 3, 1, 'Midterm', 5, 5, 5, 4, 4.85, 'Alex demonstrates outstanding frontend and backend skills. Delivers code on time with high code quality.', '2026-08-25 14:00:00'),
(2, 4, 2, 'Midterm', 5, 4, 5, 5, 4.75, 'Maria is highly proactive in UI/UX improvements and collaborates well with the team.', '2026-08-25 14:30:00'),
(3, 5, 1, 'Midterm', 4, 5, 4, 4, 4.45, 'David has strong data analysis capabilities and optimized database reporting queries.', '2026-08-25 15:00:00'),
(4, 6, 2, 'Midterm', 5, 5, 5, 5, 5.00, 'Exceptional design sensibilities and clean Tailwind CSS integration.', '2026-08-26 10:00:00'),
(5, 7, 1, 'Midterm', 4, 5, 4, 4, 4.50, 'Kevin shows deep understanding of REST architecture and security middleware.', '2026-08-26 10:30:00'),
(6, 8, 2, 'Midterm', 5, 4, 5, 5, 4.80, 'Chloe writes thorough test plans and catches edge cases during QA verification.', '2026-08-26 11:00:00'),
(7, 9, 1, 'Midterm', 4, 4, 4, 5, 4.30, 'Joshua is making great progress on mobile responsiveness and accessibility.', '2026-08-27 13:30:00'),
(8, 10, 2, 'Midterm', 5, 5, 5, 4, 4.85, 'Patricia is proactive in containerization and environment configuration.', '2026-08-27 14:00:00'),
(9, 11, 1, 'Midterm', 5, 4, 5, 4, 4.60, 'Christian demonstrates diligence in auditing code and securing endpoints.', '2026-08-28 09:30:00'),
(10, 12, 2, 'Midterm', 4, 5, 4, 5, 4.55, 'Hannah quickly grasps complex system requirements and documentation standards.', '2026-08-28 10:00:00');
