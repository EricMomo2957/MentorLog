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

// Map basic info
$user_id    = $data->user_id;
$full_name  = isset($data->full_name) ? $data->full_name : null;
$email      = isset($data->email) ? $data->email : null;
$phone      = isset($data->phone) ? $data->phone : null;

// --- UNIVERSAL MAPPING LOGIC ---
// This handles different keys coming from StudentProfile vs AdminProfile

// 1. ID Number (student_id vs employee_id)
$id_number = null;
if (isset($data->student_id)) {
    $id_number = $data->student_id;
} elseif (isset($data->employee_id)) {
    $id_number = $data->employee_id;
}

// 2. Dept/Course (course vs department)
$course_or_dept = null;
if (isset($data->course)) {
    $course_or_dept = $data->course;
} elseif (isset($data->department)) {
    $course_or_dept = $data->department;
}

// 3. Level/Role (year_level vs role_title)
$level_or_role = null;
if (isset($data->year_level)) {
    $level_or_role = $data->year_level;
} elseif (isset($data->role_title)) {
    $level_or_role = $data->role_title;
}

// 2. Prepare the UPDATE statement
$sql = "UPDATE users SET 
        full_name = COALESCE(?, full_name), 
        email = COALESCE(?, email), 
        phone = COALESCE(?, phone), 
        student_id = COALESCE(?, student_id), 
        course = COALESCE(?, course), 
        year_level = COALESCE(?, year_level) 
        WHERE id = ?";

$stmt = $conn->prepare($sql);

if ($stmt) {
    // "ssssssi" = 6 strings and 1 integer (user_id)
    $stmt->bind_param("ssssssi", 
        $full_name, 
        $email, 
        $phone, 
        $id_number, 
        $course_or_dept, 
        $level_or_role, 
        $user_id
    );

    if ($stmt->execute()) {
        // errno === 0 check ensures success even if no text was actually changed
        if ($stmt->affected_rows > 0 || $stmt->errno === 0) {
            echo json_encode(["success" => true, "message" => "Profile updated successfully!"]);
        } else {
            echo json_encode(["success" => false, "message" => "No changes were detected."]);
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