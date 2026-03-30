<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Database Connection
$conn = new mysqli("localhost", "root", "", "mentorlog_db");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]));
}

// Get the JSON data from the request body
$data = json_decode(file_get_contents('php://input'), true);

if ($data && isset($data['user_id'], $data['title'], $data['due_date'])) {
    $user_id = $data['user_id'];
    $title = $data['title'];
    $task_description = $data['task_description'] ?? '';
    $due_date = $data['due_date'];
    $status = $data['status'] ?? 'Pending';

    // Prepare SQL to match your table columns: user_id, title, task_description, due_date, status
    $stmt = $conn->prepare("INSERT INTO tasks (user_id, title, task_description, due_date, status) VALUES (?, ?, ?, ?, ?)");
    
    // Bind parameters: i = integer, s = string
    $stmt->bind_param("issss", $user_id, $title, $task_description, $due_date, $status);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true, 
            "message" => "Task assigned successfully",
            "task_id" => $conn->insert_id
        ]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "Incomplete task data provided."]);
}

$conn->close();
?>