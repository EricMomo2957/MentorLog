<?php
// Required Headers for Cross-Origin (Desktop to XAMPP)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Connect to your database (mentorlog_db)
$conn = new mysqli("localhost", "root", "", "mentorlog_db");

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed"]));
}

// Fetch only users with the 'student' role
$sql = "SELECT id, full_name, role FROM users WHERE role = 'student'";
$result = $conn->query($sql);

$students = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
}

echo json_encode($students);
$conn->close();
?>