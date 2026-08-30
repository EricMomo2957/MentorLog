import db from './db';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
    console.log("🌱 Starting MentorLog Database Seeding...");

    try {
        // 1. Create Default Admin User
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        const [adminRows]: any = await db.execute('SELECT id FROM users WHERE email = ?', ['admin@mentorlog.com']);
        
        let adminId: number;
        if (adminRows.length === 0) {
            const [result]: any = await db.execute(`
                INSERT INTO users (full_name, email, password, role, is_active, required_hours)
                VALUES ('System Administrator', 'admin@mentorlog.com', ?, 'admin', true, 0)
            `, [adminPasswordHash]);
            adminId = result.insertId;
            console.log("✅ Created Default Admin Account: admin@mentorlog.com / admin123");
        } else {
            adminId = adminRows[0].id;
            console.log("ℹ️ Admin Account already exists (id:", adminId, ")");
        }

        // 2. Create Sample Student Intern Accounts
        const studentPasswordHash = await bcrypt.hash('student123', 10);
        const sampleStudents = [
            {
                name: 'Alex Johnson',
                email: 'alex.johnson@student.edu',
                student_id: 'INT-2026-001',
                course: 'BS Information Technology',
                position: 'Full Stack Web Developer',
                school: 'State University of Technology',
                hours: 600
            },
            {
                name: 'Maria Santos',
                email: 'maria.santos@student.edu',
                student_id: 'INT-2026-002',
                course: 'BS Computer Science',
                position: 'Frontend Web Developer',
                school: 'National Science Academy',
                hours: 500
            },
            {
                name: 'David Cruz',
                email: 'david.cruz@student.edu',
                student_id: 'INT-2026-003',
                course: 'BS Information Systems',
                position: 'Data Analyst / Business Intelligence',
                school: 'Metropolitan Institute of Tech',
                hours: 600
            }
        ];

        const insertedStudentIds: number[] = [];

        for (const s of sampleStudents) {
            const [rows]: any = await db.execute('SELECT id FROM users WHERE email = ?', [s.email]);
            if (rows.length === 0) {
                const [res]: any = await db.execute(`
                    INSERT INTO users (full_name, email, password, student_id, course, it_position, school_name, ojt_hours_required, required_hours, role, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'student', true)
                `, [s.name, s.email, studentPasswordHash, s.student_id, s.course, s.position, s.school, s.hours, s.hours]);
                insertedStudentIds.push(res.insertId);
                console.log(`✅ Created Sample Student: ${s.name} (${s.email})`);
            } else {
                insertedStudentIds.push(rows[0].id);
            }
        }

        // 3. Create Default Admin Code for New Admin Registrations
        const [codeRows]: any = await db.execute('SELECT id FROM admin_codes WHERE code = ?', ['MENTORLOG-ADMIN-2026']);
        if (codeRows.length === 0) {
            await db.execute(`
                INSERT INTO admin_codes (code, is_used, created_by)
                VALUES ('MENTORLOG-ADMIN-2026', false, ?)
            `, [adminId]);
            console.log("✅ Created Initial Admin Registration Code: MENTORLOG-ADMIN-2026");
        }

        // 4. Create Sample Tasks
        if (insertedStudentIds.length > 0) {
            const firstStudentId = insertedStudentIds[0];
            const [taskRows]: any = await db.execute('SELECT id FROM tasks WHERE user_id = ?', [firstStudentId]);
            if (taskRows.length === 0) {
                await db.execute(`
                    INSERT INTO tasks (user_id, title, task_description, status, due_date)
                    VALUES (?, 'Setup Local Development Environment', 'Install Node.js, VS Code, Git, and clone the MentorLog repository.', 'Completed', CURDATE())
                `, [firstStudentId]);
                await db.execute(`
                    INSERT INTO tasks (user_id, title, task_description, status, due_date)
                    VALUES (?, 'Implement API Dashboard Metrics', 'Build REST endpoints for dashboard summary stats and chart data.', 'In-Progress', DATE_ADD(CURDATE(), INTERVAL 3 DAY))
                `, [firstStudentId]);
                console.log("✅ Created Sample Tasks for Intern");
            }
        }

        // 5. Create Sample Announcements
        const [annRows]: any = await db.execute('SELECT id FROM announcements LIMIT 1');
        if (annRows.length === 0) {
            await db.execute(`
                INSERT INTO announcements (title, content, admin_id)
                VALUES ('Welcome to OJT Internship Program 2026!', 'We are excited to welcome our new cohort of interns. Please complete your profile details and upload your mandatory documents.', ?)
            `, [adminId]);
            console.log("✅ Created Initial Announcement");
        }

        // 6. Create Sample Campus Event
        const [eventRows]: any = await db.execute('SELECT id FROM events LIMIT 1');
        if (eventRows.length === 0) {
            await db.execute(`
                INSERT INTO events (user_id, title, description, location, start_time, end_time)
                VALUES (?, 'OJT Midterm Performance Evaluation', 'Individual evaluation sessions with OJT Mentors and Supervisors.', 'Main Conference Room / Online Zoom', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY))
            `, [adminId]);
            console.log("✅ Created Initial Event");
        }

        console.log("\n🎉 Database Seeding Completed Successfully!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Error Seeding Database:", err);
        process.exit(1);
    }
};

seedDatabase();
