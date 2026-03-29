<?php
// Required headers for Cross-Origin and JSON processing
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request from the browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// 1. Database Connection
$conn = new mysqli("localhost", "root", "", "mentorlog_db");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connection failed"]);
    exit;
}

// 2. Get the JSON data from the React frontend
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    $user_id = $data['user_id'];
    $title = $data['title'];
    $task_desc = $data['task_description'];
    $due_date = $data['due_date'];
    $status = $data['status'] ?? 'Pending';

    // 3. SQL Insert Query
    // Note: 'status' defaults to 'Pending' as seen in your React state
    $stmt = $conn->prepare("INSERT INTO tasks (user_id, title, task_description, due_date, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issss", $user_id, $title, $task_desc, $due_date, $status);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Task created successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "No data provided"]);
}

$conn->close();
?>