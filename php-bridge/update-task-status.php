<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db_connection.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['taskId']) && isset($data['status'])) {
    $taskId = intval($data['taskId']);
    $status = $data['status'];

    $query = "UPDATE tasks SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("si", $status, $taskId);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Status updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data"]);
}
?>