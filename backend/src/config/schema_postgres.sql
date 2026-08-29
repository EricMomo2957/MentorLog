-- ==============================================================================
-- MentorLog PostgreSQL Database Schema
-- Location: backend/src/config/schema_postgres.sql
-- ==============================================================================

-- Custom ENUM Types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('Pending', 'In-Progress', 'Completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('Pending', 'Processing', 'Accepted', 'Rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_urgency AS ENUM ('Normal', 'Urgent', 'Immediate Attention');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE question_status AS ENUM ('pending', 'replied', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE question_sender_role AS ENUM ('admin', 'intern');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE reset_status AS ENUM ('pending', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('Present', 'Late', 'Absent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE evaluation_type_enum AS ENUM ('Midterm', 'Final');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  member_title VARCHAR(20) DEFAULT NULL,
  first_name VARCHAR(100) DEFAULT NULL,
  middle_name VARCHAR(100) DEFAULT NULL,
  last_name VARCHAR(100) DEFAULT NULL,
  id_number VARCHAR(50) DEFAULT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  age INT DEFAULT NULL,
  gender VARCHAR(20) DEFAULT NULL,
  civil_status VARCHAR(30) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  school_name VARCHAR(255) DEFAULT NULL,
  student_id VARCHAR(50) DEFAULT NULL,
  course VARCHAR(100) DEFAULT NULL,
  year_level VARCHAR(10) DEFAULT NULL,
  it_position VARCHAR(100) DEFAULT NULL,
  ojt_hours_required INT DEFAULT 600,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  required_hours INT DEFAULT 600,
  profile_pic VARCHAR(255) DEFAULT NULL
);

-- 2. tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title VARCHAR(150) NOT NULL,
  task_description TEXT DEFAULT NULL,
  status task_status DEFAULT 'Pending',
  due_date DATE DEFAULT NULL,
  attachment_url VARCHAR(255) DEFAULT NULL,
  attachment_name VARCHAR(255) DEFAULT NULL
);

-- 3. service_requests
CREATE TABLE IF NOT EXISTS service_requests (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status request_status DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  urgency request_urgency DEFAULT 'Normal'
);

-- 4. intern_questions
CREATE TABLE IF NOT EXISTS intern_questions (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  admin_reply TEXT DEFAULT NULL,
  status question_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. question_replies
CREATE TABLE IF NOT EXISTS question_replies (
  id SERIAL PRIMARY KEY,
  question_id INT NOT NULL REFERENCES intern_questions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  sender_role question_sender_role NOT NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. password_resets
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status reset_status DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. feedbacks
CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  rating INT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. document_submissions
CREATE TABLE IF NOT EXISTS document_submissions (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  status submission_status DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  feedback TEXT DEFAULT NULL
);

-- 10. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  action VARCHAR(50) NOT NULL,
  module VARCHAR(100) NOT NULL,
  details TEXT DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. attendance
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  date DATE NOT NULL,
  clock_in TIME NOT NULL,
  clock_out TIME DEFAULT NULL,
  status attendance_status DEFAULT 'Present',
  total_hours NUMERIC(5,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT FALSE
);

-- 12. announcements
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  admin_id INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. admin_codes
CREATE TABLE IF NOT EXISTS admin_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. email_verifications
CREATE TABLE IF NOT EXISTS email_verifications (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  payload TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. evaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  evaluator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  evaluation_type evaluation_type_enum NOT NULL,
  professionalism INT NOT NULL DEFAULT 5,
  technical_skills INT NOT NULL DEFAULT 5,
  punctuality INT NOT NULL DEFAULT 5,
  communication INT NOT NULL DEFAULT 5,
  overall_score NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  comments TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
