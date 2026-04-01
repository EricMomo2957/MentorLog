<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db_connection.php';

// 1. Get the JSON data from the React frontend
$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->user_id)) {
    echo json_encode(["success" => false, "message" => "Invalid data or missing User ID."]);
    exit();
}

$user_id = $data->user_id;
$full_name = $data->full_name;
$email = $data->email;
$phone = $data->phone;
// Optional: If you want to allow updating these from the modal too
$student_id = isset($data->student_id) ? $data->student_id : null;
$course = isset($data->course) ? $data->course : null;
$year_level = isset($data->year_level) ? $data->year_level : null;

// 2. Prepare the UPDATE statement
// We use 'full_name' with an underscore to match your latest table structure
$sql = "UPDATE users SET 
        full_name = ?, 
        email = ?, 
        phone = ?, 
        student_id = COALESCE(?, student_id), 
        course = COALESCE(?, course), 
        year_level = COALESCE(?, year_level) 
        WHERE id = ?";

$stmt = $conn->prepare($sql);

if ($stmt) {
    // "ssssssi" = 6 strings and 1 integer (the user_id)
    $stmt->bind_param("ssssssi", 
        $full_name, 
        $email, 
        $phone, 
        $student_id, 
        $course, 
        $year_level, 
        $user_id
    );

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0 || $stmt->errno === 0) {
            echo json_encode(["success" => true, "message" => "Profile updated successfully!"]);
        } else {
            echo json_encode(["success" => false, "message" => "No changes were made."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Update failed: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
}

$conn->close();
?>