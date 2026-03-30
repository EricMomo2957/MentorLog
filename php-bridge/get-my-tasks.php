<?php
// 1. Headers for CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// 2. Handle Preflight (Crucial for React/Vite)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connection.php';

// 3. Get user_id from the URL query string
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id > 0) {
    // Select specific columns to ensure they match your Task interface in React
    $query = "SELECT id, user_id, title, task_description, status, due_date FROM tasks WHERE user_id = ? ORDER BY id DESC";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }

    // Matches 'if (resData.status === "success")' in MyTasks.tsx
    echo json_encode([
        "status" => "success", 
        "data" => $tasks
    ]);
} else {
    // Helpful for debugging if the ID is missing
    echo json_encode([
        "status" => "error", 
        "message" => "Invalid or missing User ID. Received: " . (isset($_GET['user_id']) ? $_GET['user_id'] : 'null')
    ]);
}
?>