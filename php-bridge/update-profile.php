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
$data = json_decode(file_get_contents("php://input"), true); // true converts to associative array

if (!$data || !isset($data['user_id'])) {
    echo json_encode(["success" => false, "message" => "Invalid data or missing User ID."]);
    exit();
}

$user_id      = $data['user_id'];
$full_name    = isset($data['full_name']) ? $data['full_name'] : null;
$phone        = isset($data['phone']) ? $data['phone'] : null;
$current_pass = isset($data['currentPassword']) ? $data['currentPassword'] : null;
$new_pass     = isset($data['newPassword']) ? $data['newPassword'] : null;

// --- UNIVERSAL MAPPING LOGIC ---
$id_number = isset($data['student_id']) ? $data['student_id'] : (isset($data['employee_id']) ? $data['employee_id'] : null);
$course_or_dept = isset($data['course']) ? $data['course'] : (isset($data['department']) ? $data['department'] : null);
$level_or_role = isset($data['year_level']) ? $data['year_level'] : (isset($data['role_title']) ? $data['role_title'] : null);

// 2. Fetch current user from DB to verify password
$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit();
}

$password_to_save = null; // Will remain null unless a new password is set

// 3. Password Validation Logic
if (!empty($new_pass)) {
    // Check if current password is provided and matches
    if (empty($current_pass) || !password_verify($current_pass, $user['password'])) {
        echo json_encode(["success" => false, "message" => "Current password incorrect or not provided."]);
        exit();
    }
    // Hash the new password
    $password_to_save = password_hash($new_pass, PASSWORD_BCRYPT);
}

// 4. Final UPDATE Statement
// We use COALESCE so if a value is null, it keeps the current value in the database
$sql = "UPDATE users SET 
        full_name = COALESCE(?, full_name), 
        phone = COALESCE(?, phone), 
        student_id = COALESCE(?, student_id), 
        course = COALESCE(?, course), 
        year_level = COALESCE(?, year_level),
        password = COALESCE(?, password) 
        WHERE id = ?";

$updateStmt = $conn->prepare($sql);

if ($updateStmt) {
    // "ssssssi" = 6 strings and 1 integer
    $updateStmt->bind_param("ssssssi", 
        $full_name, 
        $phone, 
        $id_number, 
        $course_or_dept, 
        $level_or_role, 
        $password_to_save, // If this is null, COALESCE handles it
        $user_id
    );

    if ($updateStmt->execute()) {
        echo json_encode(["success" => true, "message" => "Profile updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed: " . $updateStmt->error]);
    }
    $updateStmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
}

$conn->close();
?>