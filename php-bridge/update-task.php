<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$conn = new mysqli("localhost", "root", "", "mentorlog_db");
$data = json_decode(file_get_contents('php://input'), true);

if ($data && isset($data['id'])) {
    $id = $data['id'];
    $user_id = $data['user_id'];
    $title = $data['title'];
    $desc = $data['task_description'];
    $due = $data['due_date'];
    $status = $data['status'];

    $stmt = $conn->prepare("UPDATE tasks SET user_id=?, title=?, task_description=?, due_date=?, status=? WHERE id=?");
    // Quick check: Ensure your update-task.php bind_param matches the Task interface
    $stmt->bind_param("issssi", $user_id, $title, $desc, $due, $status, $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
}
$conn->close();
?>