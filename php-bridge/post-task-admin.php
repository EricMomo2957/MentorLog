<?php
// 1. Enhanced Headers for CORS and Preflight
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Include database connection
require_once 'db_connection.php'; 

// 3. Get the raw POST data
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if ($data) {
    // Basic validation to prevent empty inserts
    if(empty($data['user_id']) || empty($data['title'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    $user_id = $data['user_id'];
    $title = $data['title'];
    $desc = $data['task_description']; 
    $status = 'Pending';
    $due_date = $data['due_date'];

    // 4. Prepare and Execute
    $query = "INSERT INTO tasks (user_id, title, task_description, status, due_date) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    
    // "issss" means: integer, string, string, string, string
    $stmt->bind_param("issss", $user_id, $title, $desc, $status, $due_date);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Task assigned!"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No data received. Raw input: " . $input]);
}
?>