<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// 1. Database Connection
$conn = new mysqli("localhost", "root", "", "mentorlog_db");

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed"]));
}

// 2. SQL Query with JOIN to get the student's name
// This matches the 'student_name' property expected in your React Task interface
$sql = "SELECT 
            t.*, 
            u.full_name AS student_name 
        FROM tasks t
        LEFT JOIN users u ON t.user_id = u.id 
        ORDER BY t.due_date ASC";

$result = $conn->query($sql);

$tasks = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Ensure numeric IDs are returned as integers if needed
        $row['id'] = (int)$row['id'];
        $row['user_id'] = (int)$row['user_id'];
        $tasks[] = $row;
    }
}

// 3. Output as JSON
echo json_encode($tasks);

$conn->close();
?>